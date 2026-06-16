from __future__ import annotations

import json
import zipfile
from datetime import datetime
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
DIST = ROOT / "dist"
UNPACK_SCRIPT = ROOT / "scripts" / "unpack_and_install.py"

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


def plugin_version() -> str:
    payload = json.loads((ROOT / ".codex-plugin" / "plugin.json").read_text(encoding="utf-8"))
    return str(payload.get("version") or datetime.now().strftime("%Y%m%d%H%M"))


def installer_cmd() -> str:
    return """@echo off
chcp 65001 >nul
setlocal
set "PYTHON=python"
where python >nul 2>nul
if errorlevel 1 (
  set "PYTHON=py"
  where py >nul 2>nul
  if errorlevel 1 (
    echo 未检测到 Python。请先安装 Python 3，然后重新双击本文件。
    echo 下载地址：https://www.python.org/downloads/
    echo.
    pause
    exit /b 1
  )
)
"%PYTHON%" "%~dp0unpack_and_install.py" --start
echo.
pause
"""


def installer_readme(version: str) -> str:
    return f"""连载小说写作控制台 一键安装包
版本：{version}

使用方法：

1. 先把这个安装包 zip 解压出来。
2. 双击“一键解包安装.cmd”。
3. 等待安装完成。
4. 程序会尝试自动启动网页端。
5. 如果浏览器没有自动打开，请手动打开：
   http://127.0.0.1:8787/

注意：

1. 新电脑需要先安装 Python 3。
2. 如果要用 Codex 直接生成，新电脑也需要安装并登录 Codex。
3. Codex 模式不需要 API Key。
4. 安装/更新不会覆盖 projects/ 小说项目文件夹。
5. 小说项目建议在旧电脑网页端“导出”，在新电脑网页端“导入”。
6. 安装时会尝试生成桌面“启动小说控制台.exe”，以后双击它即可启动。

这个安装包里包含：

- 一键解包安装.cmd
- install_novel_writer.cmd
- unpack_and_install.py
- novel-writer-{version}.zip
- 安装后生成的桌面启动器
"""


def create_installer_bundle(package_path: Path, version: str) -> Path:
    installer_path = DIST / f"novel-writer-installer-{version}.zip"
    unpack_text = UNPACK_SCRIPT.read_text(encoding="utf-8")
    with zipfile.ZipFile(installer_path, "w", compression=zipfile.ZIP_DEFLATED) as archive:
        archive.write(package_path, package_path.name)
        archive.writestr("unpack_and_install.py", unpack_text)
        archive.writestr("一键解包安装.cmd", installer_cmd())
        archive.writestr("install_novel_writer.cmd", installer_cmd())
        archive.writestr("README-先看我.txt", installer_readme(version))
    return installer_path


def main() -> int:
    DIST.mkdir(parents=True, exist_ok=True)
    version = plugin_version()
    package_path = DIST / f"novel-writer-{version}.zip"
    with zipfile.ZipFile(package_path, "w", compression=zipfile.ZIP_DEFLATED) as archive:
        for item in ROOT.rglob("*"):
            rel = item.relative_to(ROOT)
            if should_skip(rel) or item.is_dir():
                continue
            archive.write(item, Path("novel-writer") / rel)
    installer_path = create_installer_bundle(package_path, version)
    print(f"Created {package_path}")
    print(f"Created {installer_path}")
    print("This package excludes projects/, .runtime/, logs, caches, and dist/.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
