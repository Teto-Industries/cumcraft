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


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--version", required=True)
    parser.add_argument("--output", required=True, type=Path)
    args = parser.parse_args()

    mods = json.loads((ROOT / "mods.json").read_text())
    pack = json.loads((ROOT / "client/pack.json").read_text())
    files = [
        {
            "path": f"mods/{name}",
            "hashes": {"sha1": mod["sha1"], "sha512": mod["sha512"]},
            "env": {"client": "required", "server": "unsupported"},
            "downloads": [mod["url"]],
            "fileSize": mod["size"],
        }
        for name, mod in sorted(mods.items())
        if "client" in mod["sides"]
    ]
    index = {
        "formatVersion": 1,
        "game": "minecraft",
        "versionId": args.version,
        "name": pack["server"]["name"],
        "files": files,
        "dependencies": {"minecraft": pack["minecraft"], "fabric-loader": pack["fabricLoader"]},
    }

    overrides = ROOT / "client/overrides"
    with zipfile.ZipFile(args.output, "w") as archive:
        write_entry(archive, "modrinth.index.json", (json.dumps(index, indent=2) + "\n").encode())
        for path in sorted(overrides.rglob("*")):
            if path.is_file() and path != overrides / "servers.dat":
                write_entry(archive, f"overrides/{path.relative_to(overrides).as_posix()}", path.read_bytes())
        write_entry(archive, "overrides/servers.dat", servers_dat(pack["server"]))


if __name__ == "__main__":
    main()
