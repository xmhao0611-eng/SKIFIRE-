@echo off
setlocal
cd /d "%~dp0.."
python "%~dp0install_or_update_plugin.py" --source "%~dp0.." %*
echo.
pause
