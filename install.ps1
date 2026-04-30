# Notas Installation Script for Windows
# Downloads and installs the latest notas.exe

Write-Host "Notas Installer" -ForegroundColor Cyan
Write-Host "===============" -ForegroundColor Cyan

$InstallDir = "$env:LOCALAPPDATA\Programs\Notas"
$NotasExe = "$InstallDir\notas.exe"

# Create install directory
if (-not (Test-Path $InstallDir)) {
    New-Item -ItemType Directory -Path $InstallDir -Force | Out-Null
    Write-Host "Created install directory: $InstallDir" -ForegroundColor Green
}

# Download latest release
Write-Host "Downloading latest release..." -ForegroundColor Yellow
try {
    $release = Invoke-RestMethod -Uri "https://api.github.com/repos/TwitteryBeast12/Notas/releases/latest"
    $asset = $release.assets | Where-Object { $_.name -eq "notas-win.exe" }
    
    if (-not $asset) {
        throw "notas-win.exe not found in latest release"
    }
    
    Invoke-WebRequest -Uri $asset.browser_download_url -OutFile $NotasExe
    Write-Host "Downloaded notas.exe" -ForegroundColor Green
} catch {
    Write-Host "Download failed: $_" -ForegroundColor Red
    exit 1
}

# Add to PATH (user-level)
$currentPath = [Environment]::GetEnvironmentVariable("Path", "User")
if ($currentPath -notlike "*$InstallDir*") {
    [Environment]::SetEnvironmentVariable("Path", "$currentPath;$InstallDir", "User")
    Write-Host "Added to PATH" -ForegroundColor Green
}

# Copy PowerShell wrapper
$psWrapper = @"
# Notas PowerShell Wrapper
`$Global:NotasSessionActive = `$false
`$Global:CurrentSessionId = ""

function Start-NotasCapture {
    param([string]`$SessionName = `(Get-Date -Format "yyyyMMdd_HHmmss`))
    if (`$Global:NotasSessionActive) {
        Write-Host "Notas is already capturing." -ForegroundColor Yellow
        return
    }
    try {
        `$result = notas rec `$SessionName 2>&1
        if (`$LASTEXITCODE -eq 0) {
            `$Global:NotasSessionActive = `$true
            `$Global:CurrentSessionId = `$SessionName
            Write-Host `$result -ForegroundColor Green
        }
    } catch {
        Write-Host "notas command not found. Install from: https://github.com/TwitteryBeast12/Notas/releases" -ForegroundColor Red
    }
}

function Stop-NotasCapture {
    if (-not `$Global:NotasSessionActive) {
        Write-Host "Notas is not capturing." -ForegroundColor Yellow
        return
    }
    try {
        `$result = notas stop `$Global:CurrentSessionId 2>&1
        if (`$LASTEXITCODE -eq 0) {
            Write-Host `$result -ForegroundColor Green
            `$Global:NotasSessionActive = `$false
            `$Global:CurrentSessionId = ""
        }
    } catch {
        Write-Host "notas command not found." -ForegroundColor Red
    }
}

Set-Alias -Name notas-rec -Value Start-NotasCapture -Force
Set-Alias -Name notas-stop -Value Stop-NotasCapture -Force
"@

$psPath = "$env:USERPROFILE\Documents\WindowsPowerShell\notas-wrapper.ps1"
$psWrapper | Out-File -FilePath $psPath -Encoding utf8
Write-Host "Created PowerShell wrapper: $psPath" -ForegroundColor Green

# Verify installation
Write-Host ""
Write-Host "Verifying installation..." -ForegroundColor Yellow
try {
    $env:Path = "$env:Path;$InstallDir"
    $version = & "$NotasExe" --version 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Verification successful: $version" -ForegroundColor Green
    } else {
        throw "Command failed"
    }
} catch {
    Write-Host "⚠️  Verification failed - notas.exe may not be executable" -ForegroundColor Yellow
    Write-Host "   Try running: & '$NotasExe' --help" -ForegroundColor Yellow
}

# Final instructions
Write-Host ""
Write-Host "Installation complete!" -ForegroundColor Green
Write-Host ""
Write-Host "What was installed:" -ForegroundColor Cyan
Write-Host "  - notas.exe (CLI tool) v$($version -replace 'notas-cli ', '')"
Write-Host "  - PowerShell wrapper (notas-rec, notas-stop)"
Write-Host "  - Added to PATH"
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Cyan
Write-Host "  1. Run: notas config (creates ~/.notas/config.json)"
Write-Host "  2. Edit config.json with your AI provider (Ollama/OpenAI)"
Write-Host "  3. Record your first session:"
Write-Host "     notas rec `"my-task`""
Write-Host "     # ... do your work ..."
Write-Host "     notas stop `"my-task`""
Write-Host "  4. Review: notas list"
Write-Host "  5. Export: notas export `"my-task`" local"
Write-Host ""
Write-Host "Full docs: https://github.com/TwitteryBeast12/Notas" -ForegroundColor Cyan
Write-Host ""
