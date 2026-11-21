import json
import re
import sys
from pathlib import Path
from tempfile import NamedTemporaryFile


def update_settings(path, settings):
    original = path.read_text() if path.exists() else ""
    updated = original
    for key, value in settings.items():
        # EasyAuth writes these top-level HOCON settings on their own lines.
        assignment = f"{key}={json.dumps(value)}"
        updated, matches = re.subn(
            rf"^{key}[ \t]*[:=].*$", lambda _: assignment, updated, flags=re.MULTILINE
        )
        if not matches:
            updated = updated.rstrip("\n") + ("\n" if updated else "") + assignment + "\n"
    if updated == original:
        return

    with NamedTemporaryFile(mode="w", dir=path.parent, delete=False) as temp:
        pending = Path(temp.name)
        try:
            temp.write(updated)
            temp.close()
            pending.replace(path)
        finally:
            pending.unlink(missing_ok=True)


def configure_easyauth(directory, password_file):
    policy = {"premium-auto-login": False}
    directory.mkdir(parents=True, exist_ok=True)
    if password_file is not None:
        password = password_file.read_text().removesuffix("\n")
        if not password or "\n" in password:
            sys.exit("EasyAuth password file must contain a single nonempty line")
        update_settings(directory / "technical.conf", {"global-password": password})
        policy["enable-global-password"] = True
    update_settings(directory / "main.conf", policy)


if __name__ == "__main__":
    configure_easyauth(Path("config/EasyAuth"), Path(sys.argv[1]) if len(sys.argv) > 1 else None)
