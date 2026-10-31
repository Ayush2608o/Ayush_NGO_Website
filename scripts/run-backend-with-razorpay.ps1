$ErrorActionPreference = "Stop"

$keyId = Read-Host "Razorpay Key ID (rzp_test_... or rzp_live_...)"
if ($keyId -notmatch '^rzp_(test|live)_[A-Za-z0-9]+$') {
    throw "That does not look like a Razorpay Key ID. Copy the Key ID from Razorpay Dashboard > Account & Settings > API Keys."
}

$secretSecure = Read-Host "Razorpay Key Secret (input hidden)" -AsSecureString
$secretBstr = [IntPtr]::Zero
$secret = $null
$previousPort = $env:PORT
$previousOrigin = $env:FRONTEND_ORIGIN
try {
    $secretBstr = [Runtime.InteropServices.Marshal]::SecureStringToBSTR($secretSecure)
    $secret = [Runtime.InteropServices.Marshal]::PtrToStringBSTR($secretBstr)
    if ([string]::IsNullOrWhiteSpace($secret)) { throw "Razorpay Key Secret cannot be empty." }

    $env:RAZORPAY_KEY_ID = $keyId
    $env:RAZORPAY_KEY_SECRET = $secret
    & (Join-Path $PSScriptRoot "..\run-backend.ps1")
} finally {
    Remove-Item Env:RAZORPAY_KEY_ID -ErrorAction SilentlyContinue
    Remove-Item Env:RAZORPAY_KEY_SECRET -ErrorAction SilentlyContinue
    if ($null -ne $previousPort) { $env:PORT = $previousPort } else { Remove-Item Env:PORT -ErrorAction SilentlyContinue }
    if ($null -ne $previousOrigin) { $env:FRONTEND_ORIGIN = $previousOrigin } else { Remove-Item Env:FRONTEND_ORIGIN -ErrorAction SilentlyContinue }
    if ($secretBstr -ne [IntPtr]::Zero) { [Runtime.InteropServices.Marshal]::ZeroFreeBSTR($secretBstr) }
    $secretSecure.Dispose()
    $secret = $null
}
