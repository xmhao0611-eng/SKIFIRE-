from __future__ import annotations

import argparse
import json
import shutil
import subprocess
import sys
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
DEFAULT_DEST = Path.home() / "plugins" / "novel-writer"
MARKETPLACE_PATH = Path.home() / ".agents" / "plugins" / "marketplace.json"

SKIP_DIRS = {
    ".git",
    ".runtime",
    ".venv",
    "__pycache__",
    "dist",
    "node_modules",
    "projects",
    "venv",
}
SKIP_FILE_NAMES = {".DS_Store", "Thumbs.db"}
SKIP_SUFFIXES = {".log", ".pyc", ".pyo", ".tmp"}
MANAGED_TOP_LEVEL = {
    ".codex-plugin",
    ".gitignore",
    "README.md",
    "SYNC.md",
    "apps",
    "assets",
    "scripts",
    "skills",
}


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="Install or update the novel-writer Codex plugin while preserving local projects."
    )
    parser.add_argument("--source", type=Path, default=ROOT, help="Plugin source folder.")
    parser.add_argument("--dest", type=Path, default=DEFAULT_DEST, help="Installed plugin folder.")
    parser.add_argument("--no-validate", action="store_true", help="Skip local plugin validation.")
    parser.add_argument(
        "--clean",
        action="store_true",
        help="Remove managed app/plugin files before copying. projects/ and .runtime/ are always preserved.",
    )
    return parser.parse_args()


def should_skip(path: Path) -> bool:
    parts = set(path.parts)
    if parts & SKIP_DIRS:
        return True
    if path.name in SKIP_FILE_NAMES:
        return True
    if path.suffix.lower() in SKIP_SUFFIXES:
        return True
    if path.name.endswith(".err.log"):
        return True
    return False


def copy_plugin(source: Path, dest: Path) -> int:
    copied = 0
    dest.mkdir(parents=True, exist_ok=True)
    for item in source.rglob("*"):
        rel = item.relative_to(source)
        if should_skip(rel):
            continue
        target = dest / rel
        if item.is_dir():
            target.mkdir(parents=True, exist_ok=True)
            continue
        target.parent.mkdir(parents=True, exist_ok=True)
        shutil.copy2(item, target)
        copied += 1
    return copied


def clean_managed_files(dest: Path) -> None:
    if not dest.exists():
        return
    for child in dest.iterdir():
        if child.name not in MANAGED_TOP_LEVEL:
            continue
        if child.is_dir():
            shutil.rmtree(child)
        else:
            child.unlink()


def update_marketplace(plugin_name: str = "novel-writer") -> None:
    MARKETPLACE_PATH.parent.mkdir(parents=True, exist_ok=True)
    if MARKETPLACE_PATH.exists():
        try:
            payload = json.loads(MARKETPLACE_PATH.read_text(encoding="utf-8-sig"))
        except json.JSONDecodeError:
            backup = MARKETPLACE_PATH.with_suffix(".json.bak")
            shutil.copy2(MARKETPLACE_PATH, backup)
            payload = {}
            print(f"Marketplace JSON was invalid, backed it up to {backup}")
    else:
        payload = {}

    payload.setdefault("name", "local-marketplace")
    payload.setdefault("interface", {"displayName": "Local Plugins"})
    payload.setdefault("plugins", [])

    entry = {
        "name": plugin_name,
        "source": {
            "source": "local",
            "path": "./plugins/novel-writer",
        },
        "policy": {
            "installation": "AVAILABLE",
            "authentication": "ON_INSTALL",
        },
        "category": "Productivity",
    }

    plugins = payload["plugins"]
    for index, item in enumerate(plugins):
        if item.get("name") == plugin_name:
            plugins[index] = entry
            break
    else:
        plugins.append(entry)

    MARKETPLACE_PATH.write_text(
        json.dumps(payload, ensure_ascii=False, indent=2) + "\n",
        encoding="utf-8",
    )


def run_validation(dest: Path) -> None:
    script = dest / "scripts" / "validate_plugin.py"
    if not script.exists():
        raise SystemExit(f"Validation script not found: {script}")
    result = subprocess.run(
        [sys.executable, str(script)],
        cwd=str(dest),
        text=True,
        stdout=subprocess.PIPE,
        stderr=subprocess.STDOUT,
    )
    print(result.stdout.rstrip())
    if result.returncode != 0:
        raise SystemExit(result.returncode)


def find_csharp_compiler() -> str | None:
    candidates = [
        Path(r"C:\Windows\Microsoft.NET\Framework64\v4.0.30319\csc.exe"),
        Path(r"C:\Windows\Microsoft.NET\Framework\v4.0.30319\csc.exe"),
    ]
    for candidate in candidates:
        if candidate.exists():
            return str(candidate)
    resolved = shutil.which("csc")
    return resolved


def desktop_dir() -> Path:
    candidates = [Path.home() / "Desktop", Path.home() / "桌面"]
    for candidate in candidates:
        if candidate.exists():
            return candidate
    return candidates[0]


def build_launcher(dest: Path) -> None:
    source = dest / "scripts" / "SerialNovelControlLauncher.cs"
    if not source.exists():
        print("Launcher source not found; skipped desktop launcher build.")
        return
    compiler = find_csharp_compiler()
    if not compiler:
        print("C# compiler not found; skipped desktop launcher build. Use scripts\\start_serial_novel_app.cmd instead.")
        return
    output = dest / "scripts" / "启动小说控制台.exe"
    command = [
        compiler,
        "/nologo",
        "/target:winexe",
        "/optimize+",
        "/codepage:65001",
        f"/out:{output}",
        str(source),
        "/reference:System.Windows.Forms.dll",
    ]
    result = subprocess.run(
        command,
        cwd=str(dest),
        text=True,
        stdout=subprocess.PIPE,
        stderr=subprocess.STDOUT,
    )
    if result.returncode != 0:
        print(result.stdout.rstrip())
        print("Launcher build failed; use scripts\\start_serial_novel_app.cmd instead.")
        return
    target = desktop_dir() / "启动小说控制台.exe"
    try:
        target.parent.mkdir(parents=True, exist_ok=True)
        shutil.copy2(output, target)
        print(f"Built launcher: {output}")
        print(f"Copied desktop launcher: {target}")
    except Exception as exc:
        print(f"Built launcher: {output}")
        print(f"Could not copy desktop launcher: {exc}")


def main() -> int:
    args = parse_args()
    source = args.source.resolve()
    dest = args.dest.resolve()
    if not (source / ".codex-plugin" / "plugin.json").exists():
        raise SystemExit(f"Source does not look like a Codex plugin: {source}")

    if source == dest:
        print(f"Source and destination are the same: {dest}")
    else:
        if args.clean:
            clean_managed_files(dest)
        copied = copy_plugin(source, dest)
        print(f"Copied {copied} plugin files to {dest}")

    (dest / "projects").mkdir(parents=True, exist_ok=True)
    (dest / ".runtime").mkdir(parents=True, exist_ok=True)
    update_marketplace()
    print(f"Updated marketplace: {MARKETPLACE_PATH}")

    if not args.no_validate:
        run_validation(dest)

    build_launcher(dest)
    print("Done. You can start the app with scripts\\start_serial_novel_app.cmd")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
