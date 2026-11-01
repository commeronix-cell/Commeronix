@echo off
title Commeronix Local Server
echo Starting Commeronix Web Platform on http://localhost:8080/...
start http://localhost:8080/
powershell.exe -ExecutionPolicy Bypass -File "%~dp0serve.ps1"
pause