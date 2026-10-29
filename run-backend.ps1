Write-Host "===================================================" -ForegroundColor Cyan
Write-Host "    Starting Asha Foundation Java Backend" -ForegroundColor Green
Write-Host "===================================================" -ForegroundColor Cyan

if (-not (Test-Path "bin")) {
    New-Item -ItemType Directory -Path "bin" | Out-Null
}

Write-Host "Compiling Java Backend (backend/NgoServer.java)..." -ForegroundColor Yellow
& javac -d bin backend\NgoServer.java

if ($LASTEXITCODE -eq 0) {
    Write-Host "Compilation successful!" -ForegroundColor Green
    Write-Host "Starting NgoServer on http://localhost:8080 ..." -ForegroundColor Cyan
    & java -cp bin backend.NgoServer
} else {
    Write-Host "Compilation failed. Install JDK 17+ and make sure javac is on PATH." -ForegroundColor Red
    exit $LASTEXITCODE
}
