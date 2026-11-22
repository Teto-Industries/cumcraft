import java.io.DataInputStream;
import java.io.DataOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.nio.ByteBuffer;
import java.nio.channels.FileChannel;
import java.nio.charset.StandardCharsets;
import java.nio.file.FileVisitResult;
import java.nio.file.Files;
import java.nio.file.LinkOption;
import java.nio.file.Path;
import java.nio.file.SimpleFileVisitor;
import java.nio.file.StandardCopyOption;
import java.nio.file.attribute.BasicFileAttributes;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import java.util.zip.GZIPInputStream;
import java.util.zip.ZipEntry;
import java.util.zip.ZipFile;
import net.minecraft.nbt.CompoundTag;
import net.minecraft.nbt.NbtAccounter;
import net.minecraft.nbt.NbtIo;
import net.minecraft.resources.Identifier;
import net.minecraft.resources.ResourceKey;
import net.minecraft.util.DirectoryLock;
import net.minecraft.world.level.ChunkPos;
import net.minecraft.world.level.chunk.storage.RegionFile;
import net.minecraft.world.level.chunk.storage.RegionStorageInfo;

public final class RemoveTraverse {
    private static final Pattern REGION = Pattern.compile("r\\.(-?\\d+)\\.(-?\\d+)\\.mca");
    private final TraverseData data = new TraverseData();

    public static void main(String[] args) throws Exception {
        if (args.length != 2) throw new IllegalArgumentException("Expected SOURCE_WORLD NEW_OUTPUT_WORLD");
        new RemoveTraverse().run(Path.of(args[0]), Path.of(args[1]));
    }

    private void run(Path source, Path output) throws IOException {
        if (Files.isSymbolicLink(source)) throw new IOException("Source is a symlink: " + source);
        source = source.toRealPath();
        if (!Files.isRegularFile(source.resolve("level.dat"), LinkOption.NOFOLLOW_LINKS)) {
            throw new IOException("Source has no regular level.dat: " + source);
        }
        Path parent = output.toAbsolutePath().getParent().toRealPath();
        output = parent.resolve(output.getFileName());
        if (output.startsWith(source)) throw new IOException("Output must not be inside source");
        if (Files.exists(output, LinkOption.NOFOLLOW_LINKS)) throw new IOException("Output already exists: " + output);

        if (Files.isSymbolicLink(source.resolve(DirectoryLock.LOCK_FILE))) throw new IOException("Source session.lock is a symlink");

        try (DirectoryLock lock = DirectoryLock.create(source)) {
            NbtIo.readCompressed(source.resolve("level.dat"), NbtAccounter.unlimitedHeap());
            Path temp = Files.createTempDirectory(parent, ".traverse-migration-");
            try {
                copyWorld(source, temp);
                processWorld(temp);
                Files.move(temp, output);
                data.printSummary();
            } finally {
                if (Files.exists(temp)) deleteTree(temp);
            }
        }
    }

    private static void copyWorld(Path source, Path target) throws IOException {
        int[] omitted = {0};
        Files.walkFileTree(source, new SimpleFileVisitor<>() {
            @Override public FileVisitResult preVisitDirectory(Path dir, BasicFileAttributes attrs) throws IOException {
                if (!dir.equals(source)) Files.createDirectory(target.resolve(source.relativize(dir)));
                return FileVisitResult.CONTINUE;
            }
            @Override public FileVisitResult visitFile(Path file, BasicFileAttributes attrs) throws IOException {
                if (attrs.isSymbolicLink()) throw new IOException("Symlink in source: " + file);
                String name = file.getFileName().toString();
                if (attrs.isRegularFile() && (name.equals("DistantHorizons.sqlite") || name.equals("DistantHorizons.sqlite-wal")
                        || name.equals("DistantHorizons.sqlite-shm") || name.equals("DistantHorizons.sqlite-journal"))) {
                    omitted[0]++;
                    return FileVisitResult.CONTINUE;
                }
                if (attrs.isRegularFile() && !file.equals(source.resolve(DirectoryLock.LOCK_FILE))) {
                    Files.copy(file, target.resolve(source.relativize(file)), StandardCopyOption.COPY_ATTRIBUTES);
                }
                return FileVisitResult.CONTINUE;
            }
        });
        System.out.println("Omitted Distant Horizons cache files: " + omitted[0]);
    }

    private void processWorld(Path root) throws IOException {
        try (var paths = Files.walk(root)) {
            for (Path path : paths.filter(Files::isRegularFile).toList()) {
                Path relative = root.relativize(path);
                String name = path.getFileName().toString();
                try {
                    if (name.endsWith(".mca")) rewriteRegion(path, relative);
                    else if (name.endsWith(".dat") || name.endsWith(".dat_old") || name.endsWith(".nbt")) rewriteFile(path, relative);
                    else if (name.endsWith(".json")) data.rewriteJson(path, relative);
                    else if (name.endsWith(".zip") && relative.startsWith("datapacks")) inspectArchive(path);
                } catch (IOException e) {
                    throw new IOException("Failed processing " + relative + ": " + e.getMessage(), e);
                }
            }
        }
    }

    private void rewriteFile(Path path, Path relative) throws IOException {
        CompoundTag tag = NbtIo.readCompressed(path, NbtAccounter.unlimitedHeap());
        if (data.rewriteNbt(tag, relative)) NbtIo.writeCompressed(tag, path);
    }

    private void rewriteRegion(Path path, Path relative) throws IOException {
        Matcher matcher = REGION.matcher(path.getFileName().toString());
        if (!matcher.matches()) throw new IOException("Invalid region filename");
        int regionX;
        int regionZ;
        try {
            regionX = Integer.parseInt(matcher.group(1));
            regionZ = Integer.parseInt(matcher.group(2));
        } catch (NumberFormatException e) {
            throw new IOException("Invalid region coordinates", e);
        }
        ByteBuffer header = ByteBuffer.allocate(8192);
        try (FileChannel channel = FileChannel.open(path)) {
            // Minecraft can leave a region file empty when it has nothing to save there.
            if (channel.size() == 0) return;
            while (header.hasRemaining() && channel.read(header) != -1) { }
        }
        if (header.hasRemaining()) throw new IOException("Truncated region header");
        header.flip();
        try (RegionFile region = new RegionFile(new RegionStorageInfo("migration", ResourceKey.create(ResourceKey.createRegistryKey(Identifier.parse("minecraft:dimension")), Identifier.parse("minecraft:overworld")), "migration"), path, path.getParent(), false)) {
            for (int index = 0; index < 1024; index++) {
                if (header.getInt(index * 4) == 0) continue;
                ChunkPos pos = new ChunkPos(regionX * 32 + index % 32, regionZ * 32 + index / 32);
                try {
                    CompoundTag tag;
                    try (DataInputStream input = region.getChunkDataInputStream(pos)) {
                        if (input == null) throw new IOException("Occupied chunk is unreadable");
                        tag = NbtIo.read(input, NbtAccounter.unlimitedHeap());
                    }
                    if (data.rewriteNbt(tag, relative)) {
                        try (DataOutputStream output = region.getChunkDataOutputStream(pos)) {
                            NbtIo.write(tag, output);
                        }
                    }
                } catch (IOException e) {
                    throw new IOException("Chunk " + pos + ": " + e.getMessage(), e);
                }
            }
        }
    }

    private static void inspectArchive(Path path) throws IOException {
        try (ZipFile zip = new ZipFile(path.toFile())) {
            var entries = zip.entries();
            while (entries.hasMoreElements()) {
                ZipEntry entry = entries.nextElement();
                if (hasTraverseReference(entry.getName())) throw new IOException("Traverse reference in archive entry " + entry.getName());
                if (entry.isDirectory()) continue;
                byte[] bytes;
                try (InputStream input = zip.getInputStream(entry)) { bytes = input.readAllBytes(); }
                if (bytes.length >= 2 && (bytes[0] & 255) == 0x1f && (bytes[1] & 255) == 0x8b) {
                    try (InputStream input = new GZIPInputStream(new java.io.ByteArrayInputStream(bytes))) { bytes = input.readAllBytes(); }
                }
                if (hasTraverseReference(new String(bytes, StandardCharsets.ISO_8859_1))) {
                    throw new IOException("Traverse reference in archive entry " + entry.getName());
                }
            }
        }
    }

    private static boolean hasTraverseReference(String text) {
        return text.contains("traverse:") || text.contains("data/traverse/") || text.contains("assets/traverse/");
    }

    private static void deleteTree(Path root) throws IOException {
        Files.walkFileTree(root, new SimpleFileVisitor<>() {
            @Override public FileVisitResult visitFile(Path file, BasicFileAttributes attrs) throws IOException {
                Files.delete(file);
                return FileVisitResult.CONTINUE;
            }
            @Override public FileVisitResult postVisitDirectory(Path dir, IOException error) throws IOException {
                if (error != null) throw error;
                Files.delete(dir);
                return FileVisitResult.CONTINUE;
            }
        });
    }
}
