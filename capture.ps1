# Notas PowerShell Wrapper
# Purpose: Call the notas CLI (notas.exe) for recording.
# Requires: notas.exe installed in PATH

$Global:NotasSessionActive = $false
$Global:CurrentSessionId = ""

function Start-NotasCapture {
    param(
        [string]$SessionName = $(Get-Date -Format "yyyyMMdd_HHmmss")
    )
    
    if ($Global:NotasSessionActive) {
        Write-Host "Notas is already capturing." -ForegroundColor Yellow
        return
    }

    try {
        $result = notas rec $SessionName 2>&1
        if ($LASTEXITCODE -eq 0) {
            $Global:NotasSessionActive = $true
            $Global:CurrentSessionId = $SessionName
            Write-Host $result -ForegroundColor Green
        } else {
            Write-Host "Error starting notas: $result" -ForegroundColor Red
        }
    } catch {
        Write-Host "notas command not found. Install from: https://github.com/TwitteryBeast12/Notas/releases" -ForegroundColor Red
    }
}

function Stop-NotasCapture {
    if (-not $Global:NotasSessionActive) {
        Write-Host "Notas is not capturing." -ForegroundColor Yellow
        return
    }

    try {
        $result = notas stop $Global:CurrentSessionId 2>&1
        if ($LASTEXITCODE -eq 0) {
            Write-Host $result -ForegroundColor Green
            $Global:NotasSessionActive = $false
            $Global:CurrentSessionId = ""
        } else {
            Write-Host "Error stopping notas: $result" -ForegroundColor Red
        }
    } catch {
        Write-Host "notas command not found." -ForegroundColor Red
    }
}

# Alias for convenience
Set-Alias -Name notas-rec -Value Start-NotasCapture -Force
Set-Alias -Name notas-stop -Value Stop-NotasCapture -Force
