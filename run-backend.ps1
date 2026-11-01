$ErrorActionPreference = 'Stop'
$backendDir = Join-Path $PSScriptRoot 'backend-node'
$localConfig = Join-Path $env:LOCALAPPDATA 'AyushNGO\backend.env'
$envFile = if (Test-Path -LiteralPath $localConfig) { $localConfig } else { Join-Path $backendDir '.env' }

$nodeCommand = Get-Command node.exe -ErrorAction SilentlyContinue
$nodeExe = if ($nodeCommand) { $nodeCommand.Source } else { Join-Path $env:ProgramFiles 'nodejs\node.exe' }
if (-not (Test-Path -LiteralPath $nodeExe)) {
    Write-Error 'Node.js was not found. Install Node.js 22.5 or newer (required for the built-in SQLite driver).'
    exit 1
}

$nodeDir = Split-Path -Parent $nodeExe
$env:Path = "$nodeDir;$env:Path"
$npm = Join-Path $nodeDir 'npm.cmd'
if (-not (Test-Path -LiteralPath $npm)) {
    Write-Error "npm.cmd was not found beside Node.js at $nodeDir."
    exit 1
}
if (-not (Test-Path -LiteralPath $envFile)) {
    Write-Error 'Local SQLite backend is not configured. Run .\setup-local.ps1 once to create the database file and private local config.'
    exit 1
}
if ((Get-Content -LiteralPath $envFile -Raw) -match 'replace-with-|your-name|generate-a-random') {
    Write-Error 'Backend config still has sample values. Set DB_PATH and a generated SESSION_SECRET before starting.'
    exit 1
}
if (-not (Test-Path -LiteralPath (Join-Path $backendDir 'node_modules'))) {
    Push-Location $backendDir
    try { & $npm install; if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE } }
    finally { Pop-Location }
}

Write-Host 'Starting Ayush NGO Express API at http://localhost:8085 ...' -ForegroundColor Cyan
$env:DOTENV_CONFIG_PATH = $envFile
Push-Location $backendDir
try { & $npm start; exit $LASTEXITCODE }
finally { Pop-Location }
