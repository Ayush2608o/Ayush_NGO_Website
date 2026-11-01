$ErrorActionPreference = 'Stop'
$backendDir = Join-Path $PSScriptRoot 'backend-node'
$localDir = Join-Path $env:LOCALAPPDATA 'AyushNGO'
$configFile = Join-Path $localDir 'backend.env'
$dbFile = Join-Path $localDir 'ayush_ngo_db.db'
$uploadDir = Join-Path $localDir 'uploads'
$nodeCommand = Get-Command node.exe -ErrorAction SilentlyContinue
$nodeExe = if ($nodeCommand) { $nodeCommand.Source } else { Join-Path $env:ProgramFiles 'nodejs\node.exe' }
if (-not (Test-Path -LiteralPath $nodeExe)) { Write-Error 'Node.js 22.5 or newer is required.'; exit 1 }
$nodeDir = Split-Path -Parent $nodeExe
$env:Path = "$nodeDir;$env:Path"
if (-not (Test-Path -LiteralPath (Join-Path $backendDir 'node_modules'))) { Write-Error 'Run npm install in backend-node first.'; exit 1 }
if (Test-Path -LiteralPath $configFile) { Write-Error 'A local backend config already exists; run run-backend.ps1 to start the app.'; exit 1 }

$env:AYUSH_BACKEND_CONFIG = $configFile
$env:AYUSH_DB_PATH = $dbFile
$env:AYUSH_UPLOAD_DIR = $uploadDir
Push-Location $backendDir
try {
    & $nodeExe 'src/setup-local.js'
    if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }
} finally {
    Pop-Location
    Remove-Item Env:AYUSH_BACKEND_CONFIG -ErrorAction SilentlyContinue
    Remove-Item Env:AYUSH_DB_PATH -ErrorAction SilentlyContinue
    Remove-Item Env:AYUSH_UPLOAD_DIR -ErrorAction SilentlyContinue
}

Write-Host "SQLite database created at $dbFile. Starting API at http://localhost:8085 ..." -ForegroundColor Cyan
$env:DOTENV_CONFIG_PATH = $configFile
Push-Location $backendDir
try { & (Join-Path $nodeDir 'npm.cmd') start; exit $LASTEXITCODE }
finally { Pop-Location }
