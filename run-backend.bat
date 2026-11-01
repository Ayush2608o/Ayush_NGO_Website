@echo off
echo Starting the SQLite-backed Ayush NGO service...
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0run-backend.ps1"
pause
