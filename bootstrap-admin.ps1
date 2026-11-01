$ErrorActionPreference = 'Stop'
$backendDir = Join-Path $PSScriptRoot 'backend-node'
$nodeCommand = Get-Command node.exe -ErrorAction SilentlyContinue
$nodeExe = if ($nodeCommand) { $nodeCommand.Source } else { Join-Path $env:ProgramFiles 'nodejs\node.exe' }
$configFile = Join-Path $env:LOCALAPPDATA 'AyushNGO\backend.env'
if (-not (Test-Path -LiteralPath $nodeExe)) { Write-Error 'Node.js was not found.'; exit 1 }
if (-not (Test-Path -LiteralPath $configFile)) { Write-Error 'Run .\setup-local.ps1 first.'; exit 1 }

$name = Read-Host 'Administrator full name'
$email = Read-Host 'Administrator email'
$securePassword = Read-Host 'Administrator password (12-72 characters)' -AsSecureString
$passwordPtr = [Runtime.InteropServices.Marshal]::SecureStringToBSTR($securePassword)
$previousConfig = $env:DOTENV_CONFIG_PATH
$previousName = $env:BOOTSTRAP_ADMIN_NAME
$previousEmail = $env:BOOTSTRAP_ADMIN_EMAIL
$previousPassword = $env:BOOTSTRAP_ADMIN_PASSWORD
try {
    $env:DOTENV_CONFIG_PATH = $configFile
    $env:BOOTSTRAP_ADMIN_NAME = $name.Trim()
    $env:BOOTSTRAP_ADMIN_EMAIL = $email.Trim()
    $env:BOOTSTRAP_ADMIN_PASSWORD = [Runtime.InteropServices.Marshal]::PtrToStringBSTR($passwordPtr)
    Push-Location $backendDir
    try { & $nodeExe 'src/bootstrap-admin.js'; exit $LASTEXITCODE }
    finally { Pop-Location }
} finally {
    [Runtime.InteropServices.Marshal]::ZeroFreeBSTR($passwordPtr)
    $env:DOTENV_CONFIG_PATH = $previousConfig
    $env:BOOTSTRAP_ADMIN_NAME = $previousName
    $env:BOOTSTRAP_ADMIN_EMAIL = $previousEmail
    $env:BOOTSTRAP_ADMIN_PASSWORD = $previousPassword
}
