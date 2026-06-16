@echo off
setlocal
set APP_DIR=%~dp0..
powershell -NoProfile -ExecutionPolicy Bypass -Command "$target=(Resolve-Path '%APP_DIR%\scripts\serve_web_control.py').Path; Get-CimInstance Win32_Process | Where-Object { ($_.Name -eq 'python.exe' -or $_.Name -eq 'pythonw.exe') -and $_.CommandLine -like ('*' + $target + '*') } | ForEach-Object { Stop-Process -Id $_.ProcessId -Force }" >nul 2>nul
python "%APP_DIR%\scripts\serve_web_control.py" --port 8787 --open
