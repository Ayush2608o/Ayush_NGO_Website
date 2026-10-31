@echo off
setlocal
cd /d "%~dp0"
powershell.exe -NoProfile -ExecutionPolicy Bypass -File "%~dp0scripts\run-backend-with-razorpay.ps1"
if errorlevel 1 (
  echo.
  echo Razorpay local setup did not start. Check the message above.
  pause
)
endlocal
