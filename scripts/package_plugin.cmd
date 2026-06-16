@echo off
setlocal
cd /d "%~dp0.."
python "%~dp0package_plugin.py" %*
echo.
echo 发给其他电脑时，优先发送 dist 里的 novel-writer-installer-版本号.zip
echo 对方解压后双击“一键解包安装.cmd”即可。
echo.
pause
