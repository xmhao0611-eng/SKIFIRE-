from __future__ import annotations

import argparse
import shutil
import subprocess
import sys
import tempfile
import zipfile
from pathlib import Path


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="Unpack a novel-writer package and install it into the local Codex plugin folder."
    )
    parser.add_argument("--zip", type=Path, help="Path to novel-writer-<version>.zip.")
    parser.add_argument("--start", action="store_true", help="Start the web app after install.")
    parser.add_argument("--keep-temp", action="store_true", help="Keep the temporary extracted folder.")
    parser.add_argument("--no-validate", action="store_true", help="Skip plugin validation during install.")
    return parser.parse_args()


def find_package(base_dir: Path) -> Path:
    candidates = [
        path
        for path in base_dir.glob("novel-writer-*.zip")
        if "installer" not in path.name.lower()
    ]
    if not candidates:
        raise SystemExit(
            "No novel-writer package was found. Put novel-writer-<version>.zip next to this installer."
        )
    return max(candidates, key=lambda item: item.stat().st_mtime)


def find_plugin_root(extract_dir: Path) -> Path:
    direct = extract_dir / "novel-writer" / ".codex-plugin" / "plugin.json"
    if direct.exists():
        return direct.parents[1]
    for plugin_json in extract_dir.rglob("plugin.json"):
        if plugin_json.parent.name == ".codex-plugin":
            return plugin_json.parents[1]
    raise SystemExit("The package did not contain a valid novel-writer plugin.")


def run_install(source: Path, no_validate: bool) -> None:
    installer = source / "scripts" / "install_or_update_plugin.py"
    if not installer.exists():
        raise SystemExit(f"Install script not found: {installer}")
    command = [sys.executable, str(installer), "--source", str(source)]
    if no_validate:
        command.append("--no-validate")
    result = subprocess.run(
        command,
        cwd=str(source),
        text=True,
        stdout=subprocess.PIPE,
        stderr=subprocess.STDOUT,
    )
    print(result.stdout.rstrip())
    if result.returncode != 0:
        raise SystemExit(result.returncode)


def start_app() -> None:
    start_cmd = Path.home() / "plugins" / "novel-writer" / "scripts" / "start_serial_novel_app.cmd"
    if not start_cmd.exists():
        print(f"Start script was not found: {start_cmd}")
        return
    subprocess.Popen(
        ["cmd.exe", "/c", "start", "", str(start_cmd)],
        cwd=str(start_cmd.parent),
        shell=False,
    )
    print("The web app is starting. Open http://127.0.0.1:8787/ if the browser does not open automatically.")


def main() -> int:
    args = parse_args()
    base_dir = Path(__file__).resolve().parent
    package_path = (args.zip or find_package(base_dir)).resolve()
    if not package_path.exists():
        raise SystemExit(f"Package not found: {package_path}")
    if not zipfile.is_zipfile(package_path):
        raise SystemExit(f"Not a valid zip file: {package_path}")

    temp_dir = Path(tempfile.mkdtemp(prefix="novel-writer-install-"))
    print(f"Package: {package_path}")
    print(f"Extracting to: {temp_dir}")
    try:
        with zipfile.ZipFile(package_path) as archive:
            archive.extractall(temp_dir)
        source = find_plugin_root(temp_dir)
        print(f"Plugin source: {source}")
        run_install(source, args.no_validate)
        if args.start:
            start_app()
    finally:
        if args.keep_temp:
            print(f"Temporary files kept at: {temp_dir}")
        else:
            shutil.rmtree(temp_dir, ignore_errors=True)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
