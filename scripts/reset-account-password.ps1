$ErrorActionPreference = "Stop"
$repoRoot = Split-Path -Parent $PSScriptRoot
Push-Location $repoRoot
try {
    if (-not (Get-Command javac -ErrorAction SilentlyContinue)) {
        throw "JDK is required. Install JDK 17+ so javac is available on PATH."
    }
    New-Item -ItemType Directory -Path "bin" -Force | Out-Null
    & javac -encoding UTF-8 -d bin backend\ResetAccountPassword.java
    if ($LASTEXITCODE -ne 0) { throw "Password recovery tool compilation failed." }
    & java -cp bin backend.ResetAccountPassword
    if ($LASTEXITCODE -ne 0) { throw "Password was not changed." }
} finally {
    Pop-Location
}
