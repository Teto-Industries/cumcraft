#!/usr/bin/env python3
import argparse
import json
import struct
import zipfile
from pathlib import Path


ROOT = Path(__file__).resolve().parent.parent


def nbt_string(value):
    # Java NBT strings use DataOutput's modified UTF-8 encoding.
    encoded = bytearray()
    units = value.encode("utf-16-be")
    for i in range(0, len(units), 2):
        code = int.from_bytes(units[i : i + 2], "big")
        if 0 < code <= 0x7f:
            encoded.append(code)
        elif code <= 0x7ff:
            encoded.extend((0xc0 | (code >> 6), 0x80 | (code & 0x3f)))
        else:
            encoded.extend((0xe0 | (code >> 12), 0x80 | ((code >> 6) & 0x3f), 0x80 | (code & 0x3f)))
    return struct.pack(">H", len(encoded)) + encoded


def servers_dat(server):
    def string_tag(name, value):
        return b"\x08" + nbt_string(name) + nbt_string(value)

    return (
        b"\x0a\x00\x00"  # Root compound with an empty name.
        + b"\x09" + nbt_string("servers") + b"\x0a" + struct.pack(">i", 1)
        + string_tag("name", server["name"])
        + string_tag("ip", server["address"])
        + b"\x00\x00"  # End the server compound and root compound.
    )


def write_entry(archive, name, data):
    entry = zipfile.ZipInfo(name, (1980, 1, 1, 0, 0, 0))
    entry.compress_type = zipfile.ZIP_DEFLATED
    entry.external_attr = 0o100644 << 16
    archive.writestr(entry, data)


def download(path, asset):
    return {
        "path": path,
        "hashes": {"sha1": asset["sha1"], "sha512": asset["sha512"]},
        "env": {"client": "required", "server": "unsupported"},
        "downloads": [asset["url"]],
        "fileSize": asset["size"],
    }


def client_files(mods, pack, profile):
    for name, mod in sorted(mods.items()):
        if "client" not in mod["sides"] or profile["id"] not in mod.get("profiles", [profile["id"]]):
            continue
        suffix = ".disabled" if mod.get("disabled") else ""
        yield download(f"mods/{name}{suffix}", mod)

    renderer = profile.get("shaders")
    if renderer:
        shader = pack["shaderPack"]
        yield download(f"shaderpacks/{shader['name']}", shader)
        for shader in pack["additionalShaderPacks"]:
            if renderer in shader["renderers"]:
                yield download(f"shaderpacks/{shader['name']}", shader)


def write_defaults(archive, pack, profile):
    options = pack["options"] | profile["options"]
    defaults = "".join(f"{key}:{json.dumps(value, separators=(',', ':'))}\n" for key, value in options.items())
    write_entry(archive, "overrides/options.txt", defaults.encode())
    write_entry(archive, "overrides/servers.dat", servers_dat(pack["server"]))

    renderer = profile.get("shaders")
    if renderer == "iris":
        shader = pack["shaderPack"]["name"]
        write_entry(archive, "overrides/config/iris.properties", f"enableShaders=true\nshaderPack={shader}\n".encode())
        # Iris can bind an invalid texture on world load; Mesa needs GL error checking.
        # https://github.com/IrisShaders/Iris/issues/3367
        sodium = {"performance": {"use_no_error_g_l_context": False}}
        write_entry(archive, "overrides/config/sodium-options.json", (json.dumps(sodium, indent=2) + "\n").encode())
    elif renderer == "vitrail":
        shader = pack["shaderPack"]["name"]
        write_entry(archive, "overrides/vitrail/pack.txt", f"pack={shader}\nenabled=true\n".encode())


def build_profile(output, version, pack, profile, mods):
    files = list(client_files(mods, pack, profile))
    index = {
        "formatVersion": 1,
        "game": "minecraft",
        "versionId": version,
        "name": f"{pack['server']['name']} – {profile['name']}",
        "files": files,
        "dependencies": {"minecraft": pack["minecraft"], "fabric-loader": pack["fabricLoader"]},
    }

    overrides = ROOT / "client/overrides"
    with zipfile.ZipFile(output, "w") as archive:
        write_entry(archive, "modrinth.index.json", (json.dumps(index, indent=2) + "\n").encode())
        for path in sorted(overrides.rglob("*")):
            if path.is_file():
                write_entry(archive, f"overrides/{path.relative_to(overrides).as_posix()}", path.read_bytes())
        write_defaults(archive, pack, profile)


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--version", required=True)
    parser.add_argument("--output-dir", required=True, type=Path)
    args = parser.parse_args()

    mods = json.loads((ROOT / "mods.json").read_text())
    pack = json.loads((ROOT / "client/pack.json").read_text()) | json.loads((ROOT / "server.json").read_text())
    server = pack["server"]
    server["address"] = f"{server['host']}:{server['port']}"
    args.output_dir.mkdir(parents=True, exist_ok=True)
    for profile in pack["profiles"]:
        output = args.output_dir / f"cumcraft-{profile['id']}.mrpack"
        build_profile(output, args.version, pack, profile, mods)


if __name__ == "__main__":
    main()
