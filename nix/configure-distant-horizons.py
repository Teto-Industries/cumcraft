import sys
from pathlib import Path
from tempfile import NamedTemporaryFile

import tomlkit
from tomlkit.items import Table


def merge_settings(target, overrides):
    for key, value in overrides.items():
        if isinstance(value, Table):
            merge_settings(target.setdefault(key, tomlkit.table()), value)
        elif key not in target or target[key] != value:
            target[key] = value


def configure_distant_horizons(path, overrides):
    original = path.read_text() if path.exists() else None
    if original is None:
        updated = overrides
    else:
        config = tomlkit.parse(original)
        policy = tomlkit.parse(overrides)
        # Seed the schema version on fresh installs; let the mod migrate existing files.
        del policy["_version"]
        merge_settings(config, policy)
        updated = tomlkit.dumps(config)

    if updated != original:
        with NamedTemporaryFile(mode="w", dir=path.parent, delete=False) as temp:
            pending = Path(temp.name)
            try:
                temp.write(updated)
                temp.close()
                pending.replace(path)
            finally:
                pending.unlink(missing_ok=True)


if __name__ == "__main__":
    configure_distant_horizons(Path("config/DistantHorizons.toml"), Path(sys.argv[1]).read_text())
