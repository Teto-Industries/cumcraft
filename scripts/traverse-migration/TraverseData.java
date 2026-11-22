import com.google.gson.Gson;
import com.google.gson.GsonBuilder;
import com.google.gson.JsonElement;
import com.google.gson.JsonObject;
import com.google.gson.JsonParser;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.Map;
import java.util.TreeMap;
import java.util.regex.Pattern;
import net.minecraft.nbt.CompoundTag;
import net.minecraft.nbt.ListTag;
import net.minecraft.nbt.StringTag;
import net.minecraft.nbt.Tag;
import net.minecraft.util.SimpleBitStorage;

final class TraverseData {
    private static final String PREFIX = "traverse:";
    private static final Pattern AUTUMNAL = Pattern.compile("(brown|orange|red|yellow)_autumnal_(leaves|sapling)");
    private static final Map<String, String> BIOMES = Map.ofEntries(
        Map.entry("autumnal_woods", "dappled_forest"),
        Map.entry("coniferous_forest", "taiga"),
        Map.entry("desert_shrubland", "desert"),
        Map.entry("flatlands", "plains"),
        Map.entry("lush_swamp", "swamp"),
        Map.entry("snowy_coniferous_forest", "snowy_taiga"),
        Map.entry("woodlands", "birch_forest"),
        // Biomes renamed or retired by upstream Traverse's biome remapper.
        Map.entry("arid_highlands", "windswept_savanna"),
        Map.entry("autumnal_wooded_hills", "dappled_forest"),
        Map.entry("cliffs", "stony_peaks"),
        Map.entry("coniferous_wooded_hills", "taiga"),
        Map.entry("high_coniferous_forest", "taiga"),
        Map.entry("meadow", "plains"),
        Map.entry("mini_jungle", "jungle"),
        Map.entry("plains_plateau", "plains"),
        Map.entry("rocky_edge", "plains"),
        Map.entry("rolling_hills", "windswept_forest"),
        Map.entry("snowy_cliffs", "jagged_peaks"),
        Map.entry("snowy_coniferous_wooded_hills", "snowy_taiga"),
        Map.entry("snowy_high_coniferous_forest", "snowy_taiga"),
        Map.entry("wooded_island", "forest"),
        Map.entry("wooded_plateau", "forest")
    );
    private static final Pattern FIR = Pattern.compile(
        "fir_(?:leaves|sapling|log|wood|planks|slab|pressure_plate|fence|trapdoor|fence_gate|stairs|button|door|shelf|sign|wall_sign|hanging_sign|wall_hanging_sign|boat|chest_boat)"
    );
    private static final Gson JSON = new GsonBuilder().setPrettyPrinting().create();

    private final Map<String, Long> replacements = new TreeMap<>();
    private long changes;

    private static String vanillaId(String id) {
        if (BIOMES.containsKey(id)) return BIOMES.get(id);
        if (FIR.matcher(id).matches() || id.equals("potted_fir_sapling")
            || id.equals("stripped_fir_log") || id.equals("stripped_fir_wood")) {
            return id.replace("fir_", "spruce_");
        }
        var autumnal = AUTUMNAL.matcher(id);
        if (autumnal.matches()) {
            if (autumnal.group(2).equals("sapling")) return "poplar_sapling";
            String color = autumnal.group(1);
            // Vanilla poplar has no brown variant. Orange keeps the autumn color.
            return (color.equals("brown") ? "orange" : color) + "_poplar_leaves";
        }
        if (id.startsWith("potted_") && AUTUMNAL.matcher(id.substring(7)).matches() && id.endsWith("_sapling")) {
            return "potted_poplar_sapling";
        }
        return null;
    }

    private String replaceId(String value) throws IOException {
        if (!value.startsWith(PREFIX)) {
            if (value.startsWith("#" + PREFIX)) throw new IOException("Unsupported Traverse tag: " + value);
            return value;
        }
        String path = value.substring(PREFIX.length());
        int slash = path.lastIndexOf('/');
        String mapped = vanillaId(path.substring(slash + 1));
        if (mapped == null || (slash >= 0 && !path.startsWith("recipes/") && !path.startsWith("blocks/"))) {
            throw new IOException("Unsupported Traverse ID: " + value);
        }
        String result = "minecraft:" + path.substring(0, slash + 1) + mapped;
        changed(value + " -> " + result);
        return result;
    }

    private void changed(String description) {
        ++changes;
        replacements.merge(description, 1L, Long::sum);
    }

    boolean rewriteNbt(CompoundTag root, Path path) throws IOException {
        long before = changes;
        if (path.equals(Path.of("data/fabric/registry_entries.dat"))) {
            // This is Fabric's previous-session registry, not world contents. Do not add duplicate vanilla entries.
            for (Tag tag : root.getCompoundOrEmpty("registries").values()) {
                if (tag instanceof ListTag list) removeStrings(list, PREFIX);
            }
        }
        if (path.getFileName().toString().matches("level\\.dat(_old)?")) {
            var packs = root.getCompoundOrEmpty("Data").getCompoundOrEmpty("DataPacks");
            for (String list : new String[]{"Enabled", "Disabled"}) {
                removeStrings(packs.getListOrEmpty(list), "traverse");
            }
        }
        if (path.toString().contains("data/biolith/state__")) {
            var rules = root.getCompoundOrEmpty("data").getCompoundOrEmpty("biome_replacements");
            for (String key : new ArrayList<>(rules.keySet())) {
                if (key.startsWith(PREFIX)) {
                    rules.remove(key);
                    changed("Removed stale Biolith rule for " + key);
                } else {
                    var list = rules.getListOrEmpty(key);
                    if (removeStrings(list, PREFIX) && (list.isEmpty()
                        || (list.size() == 1 && list.getStringOr(0, "").equals("biolith:vanilla")))) {
                        rules.remove(key);
                    }
                }
            }
        }
        if (path.getFileName().toString().endsWith(".mca")) {
            for (var section : root.getListOrEmpty("sections").compoundStream().toList()) {
                repack(section.getCompoundOrEmpty("block_states"), 4096, 4);
                repack(section.getCompoundOrEmpty("biomes"), 64, 1);
            }
        }
        rewriteTag(root);
        return changes != before;
    }

    private boolean removeStrings(ListTag list, String match) {
        boolean removed = false;
        for (int i = list.size() - 1; i >= 0; --i) {
            String value = list.getStringOr(i, "");
            if (match.endsWith(":") ? value.startsWith(match) : value.equals(match)) {
                list.remove(i);
                changed("Removed stale entry " + value);
                removed = true;
            }
        }
        return removed;
    }

    private Tag rewriteTag(Tag tag) throws IOException {
        return rewriteTag(tag, false);
    }

    private Tag rewriteTag(Tag tag, boolean textComponent) throws IOException {
        if (tag instanceof CompoundTag compound) {
            Map<String, Tag> renamed = null;
            for (var entry : compound.entrySet()) {
                String key = entry.getKey();
                // Literal text is not an identifier.
                if (key.equals("text") || (textComponent && key.equals("fallback"))) continue;
                if (key.equals("Command") && entry.getValue().asString().orElse("").contains(PREFIX)) {
                    throw new IOException("Command block or minecart command references Traverse; update it before migrating");
                }
                Tag converted = switch (key) {
                    case "front_text", "back_text", "minecraft:sign_text_front", "minecraft:sign_text_back" ->
                        rewriteSignText(entry.getValue());
                    case "extra", "with" -> rewriteTag(entry.getValue(), textComponent);
                    default -> rewriteTag(entry.getValue());
                };
                String mapped = replaceId(key);
                if (mapped.equals(key)) {
                    if (converted != entry.getValue()) entry.setValue(converted);
                } else {
                    if (renamed == null) renamed = new LinkedHashMap<>();
                    if (compound.contains(mapped) || renamed.putIfAbsent(mapped, converted) != null) {
                        throw new IOException("NBT keys collide after mapping " + key + " to " + mapped);
                    }
                }
            }
            if (renamed != null) {
                compound.keySet().removeIf(key -> key.startsWith(PREFIX));
                renamed.forEach(compound::put);
            }
        } else if (tag instanceof ListTag list) {
            for (int i = 0; i < list.size(); ++i) {
                Tag original = list.get(i);
                Tag mapped = rewriteTag(original, textComponent);
                if (mapped != original) list.set(i, mapped);
            }
        } else if (!textComponent && tag instanceof StringTag string) {
            String mapped = replaceId(string.value());
            if (!mapped.equals(string.value())) return StringTag.valueOf(mapped);
        }
        return tag;
    }

    private Tag rewriteSignText(Tag tag) throws IOException {
        if (tag instanceof CompoundTag signText) {
            // Sign lines may be bare strings, but structured components can still contain item IDs.
            rewriteTag(signText.getListOrEmpty("messages"), true);
            rewriteTag(signText.getListOrEmpty("filtered_messages"), true);
        }
        return tag;
    }

    private void repack(CompoundTag container, int cells, int minBits) throws IOException {
        var old = container.getListOrEmpty("palette");
        long before = changes;
        rewriteTag(old);
        if (changes == before || old.size() < 2) return;

        // Different Traverse IDs can become the same state/biome. Packed indices must then be remapped.
        var lookup = new LinkedHashMap<Tag, Integer>();
        int[] indices = new int[old.size()];
        for (int i = 0; i < indices.length; ++i) {
            indices[i] = lookup.computeIfAbsent(old.get(i), ignored -> lookup.size());
        }
        if (lookup.size() == old.size()) return;
        long[] raw = container.getLongArray("data").orElseThrow(() -> new IOException("Missing packed palette data"));
        var input = new SimpleBitStorage(bits(old.size(), minBits), cells, raw);
        var palette = new ListTag();
        palette.addAll(lookup.keySet());
        container.put("palette", palette);
        if (palette.size() == 1) {
            container.remove("data");
        } else {
            var output = new SimpleBitStorage(bits(palette.size(), minBits), cells);
            for (int i = 0; i < cells; ++i) output.set(i, indices[input.get(i)]);
            container.putLongArray("data", output.getRaw());
        }
    }

    private static int bits(int size, int minimum) {
        return Math.max(minimum, Integer.SIZE - Integer.numberOfLeadingZeros(size - 1));
    }

    void rewriteJson(Path file, Path relative) throws IOException {
        String content = Files.readString(file);
        if (!content.contains(PREFIX)) return;
        Path dir = relative.getParent();
        String directory = dir == null ? "" : dir.toString();
        if (directory.equals("stats") || directory.equals("players/stats")) {
            var root = JsonParser.parseString(content).getAsJsonObject();
            var stats = root.getAsJsonObject("stats");
            for (var category : stats.entrySet()) {
                remapJsonKeys(category.getValue().getAsJsonObject(), false);
            }
            Files.writeString(file, JSON.toJson(root) + "\n");
        } else if (directory.equals("advancements") || directory.equals("players/advancements")) {
            var root = JsonParser.parseString(content).getAsJsonObject();
            remapJsonKeys(root, true);
            Files.writeString(file, JSON.toJson(root) + "\n");
        } else {
            throw new IOException("JSON references Traverse; update it before migrating");
        }
    }

    private void remapJsonKeys(JsonObject object, boolean advancement) throws IOException {
        for (String key : new ArrayList<>(object.keySet())) {
            String mapped = replaceId(key);
            if (mapped.equals(key)) continue;
            JsonElement value = object.remove(key);
            if (advancement && key.equals("traverse:recipes/decorations/fir_shelf")) {
                var criteria = value.getAsJsonObject().getAsJsonObject("criteria");
                if (criteria != null) {
                    JsonElement obtained = criteria.remove("has_stripped_fir_log");
                    if (obtained != null && !criteria.has("has_stripped_spruce_log")) {
                        criteria.add("has_stripped_spruce_log", obtained);
                    }
                }
            }
            JsonElement existing = object.get(mapped);
            if (existing == null) {
                object.add(mapped, value);
            } else if (!advancement) {
                object.addProperty(mapped, Math.min(Integer.MAX_VALUE, existing.getAsLong() + value.getAsLong()));
            } else {
                var step = value.getAsJsonObject();
                var target = existing.getAsJsonObject();
                var criteria = target.getAsJsonObject("criteria");
                step.getAsJsonObject("criteria").entrySet().forEach(e -> {
                    if (!criteria.has(e.getKey())) criteria.add(e.getKey(), e.getValue());
                });
                target.addProperty("done", step.get("done").getAsBoolean() || target.get("done").getAsBoolean());
            }
        }
    }

    void printSummary() {
        System.out.printf("%,d Traverse references converted or removed%n", changes);
        replacements.forEach((replacement, count) -> System.out.printf("  %,8d  %s%n", count, replacement));
    }
}
