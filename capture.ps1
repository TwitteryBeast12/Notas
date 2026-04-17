# Notas PowerShell Capture Prototype
# Purpose: Securely capture PS session activity for AI documentation.

$Global:NotasSessionActive = $false
$Global:NotasLogPath = "$HOME\.notas\sessions"
$Global:CurrentSessionFile = ""

function Start-NotasCapture {
    if ($Global:NotasSessionActive) {
        Write-Host "Notas is already capturing." -ForegroundColor Yellow
        return
    }

    # Setup directories
    if (-not (Test-Path $Global:NotasLogPath)) {
        New-Item -ItemType Directory -Path $Global:NotasLogPath -Force | Out-Null
    }

    $SessionId = Get-Date -Format "yyyyMMdd_HHmmss"
    $Global:CurrentSessionFile = Join-Path $Global:NotasLogPath "session_$SessionId.json"
    $Global:NotasSessionActive = $true

    # Start Transcript for output capture
    Start-Transcript -Path (Join-Path $Global:NotasLogPath "session_$SessionId.txt") -Append

    # Override Prompt to capture command input
    $OldPrompt = $function:prompt
    function prompt {
        $input = Read-Host "PS $($Args[0])" # Simplified for POC
        # In real impl, this would use a more robust hook
        Write-Host "Capturing: $input" -ForegroundColor Gray
        
        # Security Scrubbing Logic
        $scrubbed = $input -replace '(?i)(password|secret|key|token|auth)\s*=\s*.*', '$1=[REDACTED]'
        
        $logEntry = @{
            timestamp = (Get-Date).ToString("yyyy-MM-dd HH:mm:ss")
            command = $scrubbed
        }
        $logEntry | ConvertTo-Json -Compress | Out-File -FilePath $Global:CurrentSessionFile -Append
        
        return "PS $($executionContext.SessionState.Path.CurrentLocation)> "
    }

    Write-Host "Notas capture started. Log: $Global:CurrentSessionFile" -ForegroundColor Green
}

function Stop-NotasCapture {
    if (-not $Global:NotasSessionActive) {
        Write-Host "Notas is not capturing." -ForegroundColor Yellow
        return
    }

    Stop-Transcript
    $Global:NotasSessionActive = $false
    
    # Restore prompt
    function prompt {
        return "PS $($executionContext.SessionState.Path.CurrentLocation)> "
    }

    Write-Host "Notas capture stopped." -ForegroundColor Green
}

# Export functions for module use
Export-ModuleMember -Function Start-NotasCapture, Stop-NotasCapture
