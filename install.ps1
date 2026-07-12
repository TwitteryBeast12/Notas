# Notas Installation Script for Windows
# Builds notas from source (git clone + npm install + npm run build) and
# installs a launcher. No prebuilt binary is required.

$ErrorActionPreference = "Stop"

Write-Host "Notas Installer" -ForegroundColor Cyan
Write-Host "===============" -ForegroundColor Cyan

$InstallDir = "$env:LOCALAPPDATA\Programs\Notas"
$NotasExe   = "$InstallDir\notas.bat"
$SrcDir     = "$env:USERPROFILE\.notas\src"
$Repo       = "https://github.com/TwitteryBeast12/Notas.git"

# 1. Prerequisites
if (-not (Get-Command node -ErrorAction SilentlyContinue)) {
    Write-Host "Node.js is required but not found. Install from https://nodejs.org then re-run." -ForegroundColor Red
    exit 1
}
Write-Host "Node.js $(node --version) found" -ForegroundColor Green

if (-not (Get-Command git -ErrorAction SilentlyContinue)) {
    Write-Host "git is required to build from source." -ForegroundColor Red
    exit 1
}

# 2. Install directory
if (-not (Test-Path $InstallDir)) {
    New-Item -ItemType Directory -Path $InstallDir -Force | Out-Null
}

# 3. Clone + build from source
Write-Host "Building notas from source..." -ForegroundColor Yellow
Remove-Item -Recurse -Force $SrcDir -ErrorAction SilentlyContinue
git clone --depth 1 $Repo $SrcDir
Push-Location $SrcDir
npm install
npm run build
Pop-Location

# Launcher .bat that runs the built CLI with node
Set-Content -Path $NotasExe -Value "@echo off`r`nnode `"$SrcDir\dist\cli.js`" %*"
Write-Host "Installed launcher to $NotasExe" -ForegroundColor Green

# 4. Add to PATH (user-level)
$currentPath = [Environment]::GetEnvironmentVariable("Path", "User")
if ($currentPath -notlike "*$InstallDir*") {
    [Environment]::SetEnvironmentVariable("Path", "$currentPath;$InstallDir", "User")
    Write-Host "Added to PATH" -ForegroundColor Green
}

# 5. PowerShell wrapper
$psWrapper = @"
# Notas PowerShell Wrapper
`$Global:NotasSessionActive = `$false
`$Global:CurrentSessionId = ""

function Start-NotasCapture {
    param([string]`$SessionName = (Get-Date -Format "yyyyMMdd_HHmmss"))
    if (`$Global:NotasSessionActive) { Write-Host "Notas is already capturing." -ForegroundColor Yellow; return }
    `$Global:NotasSessionActive = `$true
    `$Global:CurrentSessionId = `$SessionName
    notas rec `$SessionName
}
function Stop-NotasCapture {
    if (-not `$Global:NotasSessionActive) { Write-Host "Notas is not capturing." -ForegroundColor Yellow; return }
    notas stop `$Global:CurrentSessionId
    `$Global:NotasSessionActive = `$false
    `$Global:CurrentSessionId = ""
}
Set-Alias -Name notas-rec -Value Start-NotasCapture -Force
Set-Alias -Name notas-stop -Value Stop-NotasCapture -Force
"@
$psPath = "$env:USERPROFILE\Documents\WindowsPowerShell\notas-wrapper.ps1"
$psWrapper | Out-File -FilePath $psPath -Encoding utf8
Write-Host "Created PowerShell wrapper: $psPath" -ForegroundColor Green

# 6. Verify
Write-Host ""
Write-Host "Verifying installation..." -ForegroundColor Yellow
$env:Path = "$env:Path;$InstallDir"
try {
    $version = & "$NotasExe" --version 2>&1
    if ($LASTEXITCODE -eq 0) { Write-Host "Verification successful: $version" -ForegroundColor Green }
    else { throw "Command failed" }
} catch {
    Write-Host "Verification failed - try: & '$NotasExe' --help" -ForegroundColor Yellow
}

# 7. Final instructions
Write-Host ""
Write-Host "Installation complete!" -ForegroundColor Green
Write-Host "  - notas.bat (CLI launcher, built from source)"
Write-Host "  - PowerShell wrapper (notas-rec, notas-stop)"
Write-Host "  - Added to PATH"
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Cyan
Write-Host "  1. Run: notas config"
Write-Host "  2. Record: notas rec ""my-task""   ...work...   notas stop ""my-task"""
Write-Host "  3. Review: notas review"
Write-Host "Full docs: https://github.com/TwitteryBeast12/Notas" -ForegroundColor Cyan
