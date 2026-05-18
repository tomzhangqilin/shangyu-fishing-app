@echo off
cd /d "%~dp0"
"C:\Program Files\nodejs\node.exe" static-server.js > static-server.log 2>&1
