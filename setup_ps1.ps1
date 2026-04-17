# Notas PowerShell Setup
# Run this once to add the 'notas' command to your PowerShell profile.

$ProfilePath = $PROFILE
if (-not (Test-Path $ProfilePath)) {
    New-Item -Path $ProfilePath -ItemType File -Force | Out-Null
}

$NotasFunc = @'
function notas {
    param([string]$Action, [string]$Name = "session")
    
    switch ($Action) {
        "rec" {
            Write-Host "Notas: Starting recording session..." -ForegroundColor Green
            # Import the capture script if not loaded
            if (-not (Get-Command Start-NotasCapture -ErrorAction SilentlyContinue)) {
                . "$HOME\.notas\capture.ps1"
            }
            Start-NotasCapture
        }
        "tui" {
            Write-Host "Notas: Opening Review TUI..." -ForegroundColor Green
            python3 "$HOME\.notas\tui.py"
        }
        Default {
            Write-Host "Usage: notas {rec [name]|tui}" -ForegroundColor Yellow
        }
    }
}
'@

# Add to profile if not present
if (-not (Select-String -Path $ProfilePath -Pattern "function notas")) {
    Add-Content -Path $ProfilePath -Value $NotasFunc
    Write-Host "Notas aliases added to PowerShell profile. Please restart shell or run . `$PROFILE"
} else {
    Write-Host "Notas aliases already exist in profile."
}
