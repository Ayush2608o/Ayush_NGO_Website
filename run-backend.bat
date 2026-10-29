@echo off
echo ===================================================
echo     Starting Asha Foundation Java Backend
echo ===================================================

if not exist "bin" mkdir bin

echo Compiling Java Server...
javac -d bin backend\NgoServer.java
if %errorlevel% neq 0 (
    echo [ERROR] Compilation failed. Please make sure Java JDK is installed in your PATH.
    pause
    exit /b %errorlevel%
)

echo.
echo Java compilation successful!
echo Launching Server on port 8080...
echo.
java -cp bin backend.NgoServer

pause

