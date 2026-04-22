# Notas - PowerShell Session Capture Tool
# Load this from $PROFILE:  . "$HOME\.notas\capture.ps1"

$Global:NotasLogPath       = "$HOME\.notas\sessions"
$Global:NotasLockFile      = "$HOME\.notas\.active_session.json"
$Global:NotasSessionActive = $false
$Global:CurrentSessionFile = ""
$Global:OriginalPrompt     = $null

function Start-NotasCapture {
    param(
        [string]$SessionName
    )

    if (Test-Path $Global:NotasLockFile) {
        $existing = Get-Content $Global:NotasLockFile -Raw | ConvertFrom-Json
        Write-Host "Notas is already capturing session: $($existing.session_id)" -ForegroundColor Yellow
        Write-Host "  Started : $($existing.started_at)" -ForegroundColor Yellow
        Write-Host "  Log     : $($existing.log_file)" -ForegroundColor Yellow
        Write-Host "Run 'notas stop' to end it first." -ForegroundColor Yellow
        return
    }

    if (-not (Test-Path $Global:NotasLogPath)) {
        New-Item -ItemType Directory -Path $Global:NotasLogPath -Force | Out-Null
    }

    $SessionId = if ($SessionName) { $SessionName } else { Get-Date -Format "yyyyMMdd_HHmmss" }
    $timestamp = Get-Date -Format "yyyyMMdd_HHmmss"
    $jsonFile  = Join-Path $Global:NotasLogPath "session_$timestamp.json"
    $txtFile   = Join-Path $Global:NotasLogPath "session_$timestamp.txt"

    $Global:CurrentSessionFile = $jsonFile
    $Global:NotasSessionActive = $true

    $lockData = @{
        session_id = $SessionId
        started_at = (Get-Date).ToString("yyyy-MM-dd HH:mm:ss")
        log_file   = $jsonFile
        transcript = $txtFile
        pid        = $PID
    }
    $lockData | ConvertTo-Json | Set-Content -Path $Global:NotasLockFile -Encoding utf8

    Start-Transcript -Path $txtFile -Append | Out-Null

    $Global:OriginalPrompt = $function:prompt

    function Global:prompt {
        $lastCmd = Get-History -Count 1 -ErrorAction SilentlyContinue
        if ($lastCmd -and $Global:NotasSessionActive) {
            $cmdText  = $lastCmd.CommandLine
            $scrubbed = $cmdText -replace '(?i)(password|secret|key|token|auth)\s*=\s*\S+', '$1=[REDACTED]'
            $logEntry = @{
                timestamp = (Get-Date).ToString("yyyy-MM-dd HH:mm:ss")
                command   = $scrubbed
                duration  = ($lastCmd.EndExecutionTime - $lastCmd.StartExecutionTime).TotalSeconds
            }
            $logEntry | ConvertTo-Json -Compress | Out-File -FilePath $Global:CurrentSessionFile -Append -Encoding utf8
        }
        return "PS $($executionContext.SessionState.Path.CurrentLocation)> "
    }

    Write-Host "Notas: Capture started." -ForegroundColor Green
    Write-Host "  Session : $SessionId" -ForegroundColor Gray
    Write-Host "  Log     : $jsonFile" -ForegroundColor Gray
}

function Stop-NotasCapture {
    if ($Global:NotasSessionActive) {
        try { Stop-Transcript | Out-Null } catch { }

        if ($Global:OriginalPrompt) {
            $function:Global:prompt = $Global:OriginalPrompt
            $Global:OriginalPrompt  = $null
        }

        $Global:NotasSessionActive = $false

        if (Test-Path $Global:NotasLockFile) {
            $session = Get-Content $Global:NotasLockFile -Raw | ConvertFrom-Json
            Remove-Item $Global:NotasLockFile -Force

            $elapsed = (Get-Date) - [datetime]$session.started_at

            Write-Host ""
            Write-Host "Notas: Capture stopped." -ForegroundColor Green
            Write-Host ""
            Write-Host "  Session    : $($session.session_id)" -ForegroundColor Cyan
            Write-Host "  Duration   : $($elapsed.ToString('hh\:mm\:ss'))" -ForegroundColor Cyan
            Write-Host ""
            Write-Host "  Saved files:" -ForegroundColor White
            Write-Host "    JSON log   : $($session.log_file)" -ForegroundColor Gray
            Write-Host "    Transcript : $($session.transcript)" -ForegroundColor Gray
            Write-Host "    Directory  : $Global:NotasLogPath" -ForegroundColor Gray
            Write-Host ""
        } else {
            Write-Host "Notas: Capture stopped." -ForegroundColor Green
        }
        return
    }

    if (Test-Path $Global:NotasLockFile) {
        $session = Get-Content $Global:NotasLockFile -Raw | ConvertFrom-Json
        Remove-Item $Global:NotasLockFile -Force

        Write-Host ""
        Write-Host "Notas: Cleaned up stale session." -ForegroundColor Green
        Write-Host ""
        Write-Host "  Session    : $($session.session_id)" -ForegroundColor Cyan
        Write-Host ""
        Write-Host "  Saved files:" -ForegroundColor White
        Write-Host "    JSON log   : $($session.log_file)" -ForegroundColor Gray
        Write-Host "    Transcript : $($session.transcript)" -ForegroundColor Gray
        Write-Host "    Directory  : $Global:NotasLogPath" -ForegroundColor Gray
        Write-Host ""
    } else {
        Write-Host "Notas: Nothing is recording." -ForegroundColor Yellow
    }
}

function Get-NotasStatus {
    if ($Global:NotasSessionActive) {
        $session = Get-Content $Global:NotasLockFile -Raw | ConvertFrom-Json
        $elapsed = (Get-Date) - [datetime]$session.started_at
        Write-Host "Notas: Recording" -ForegroundColor Green
        Write-Host "  Session : $($session.session_id)" -ForegroundColor Cyan
        Write-Host "  Started : $($session.started_at)" -ForegroundColor Cyan
        Write-Host "  Elapsed : $($elapsed.ToString('hh\:mm\:ss'))" -ForegroundColor Cyan
        Write-Host "  Log     : $($session.log_file)" -ForegroundColor Cyan
    } elseif (Test-Path $Global:NotasLockFile) {
        $session = Get-Content $Global:NotasLockFile -Raw | ConvertFrom-Json
        Write-Host "Notas: Stale session found (PID $($session.pid) may have exited)." -ForegroundColor Yellow
        Write-Host "  Run 'notas stop' to clean up." -ForegroundColor Yellow
    } else {
        Write-Host "Notas: Not recording." -ForegroundColor Yellow
    }
}

function Get-NotasSessions {
    if (-not (Test-Path $Global:NotasLogPath)) {
        Write-Host "No sessions found." -ForegroundColor Yellow
        return
    }

    $jsonFiles = Get-ChildItem $Global:NotasLogPath -Filter "*.json" | Sort-Object LastWriteTime -Descending

    if ($jsonFiles.Count -eq 0) {
        Write-Host "No sessions found." -ForegroundColor Yellow
        return
    }

    Write-Host ""
    Write-Host "Recorded sessions:" -ForegroundColor Cyan
    Write-Host ""

    $index = 1
    foreach ($f in $jsonFiles) {
        $baseName   = $f.BaseName
        $txtFile    = Join-Path $Global:NotasLogPath "$baseName.txt"
        $jsonSize   = "{0:N1} KB" -f ($f.Length / 1KB)
        $txtExists  = Test-Path $txtFile
        $txtSize    = if ($txtExists) { "{0:N1} KB" -f ((Get-Item $txtFile).Length / 1KB) } else { "N/A" }

        Write-Host "  [$index] $($f.LastWriteTime.ToString('yyyy-MM-dd HH:mm:ss'))" -ForegroundColor White
        Write-Host "      JSON log   : $($f.FullName)  ($jsonSize)" -ForegroundColor Gray
        if ($txtExists) {
            Write-Host "      Transcript : $txtFile  ($txtSize)" -ForegroundColor Gray
        }
        Write-Host ""
        $index++
    }

    Write-Host "  Directory: $Global:NotasLogPath" -ForegroundColor DarkGray
    Write-Host ""
}

# --- Main entry point: the 'notas' command ---
function notas {
    param(
        [Parameter(Position = 0)]
        [string]$Command,

        [Parameter(Position = 1, ValueFromRemainingArguments)]
        [string[]]$Rest
    )

    switch ($Command) {
        "start"    {
            if ($Rest) { Start-NotasCapture -SessionName ($Rest[0]) }
            else       { Start-NotasCapture }
        }
        "stop"     { Stop-NotasCapture }
        "status"   { Get-NotasStatus }
        "list"     { Get-NotasSessions }
        "help"     {
            Write-Host ""
            Write-Host "Notas - PowerShell Session Capture" -ForegroundColor Cyan
            Write-Host ""
            Write-Host "  notas start [name]  Start recording (optional session name)"
            Write-Host "  notas stop          Stop recording"
            Write-Host "  notas status        Show current recording status"
            Write-Host "  notas list          List all recorded sessions"
            Write-Host "  notas help          Show this help"
            Write-Host ""
            Write-Host "Sessions are stored in: $Global:NotasLogPath" -ForegroundColor Gray
            Write-Host ""
        }
        default    {
            Write-Host "Unknown command: $Command" -ForegroundColor Red
            Write-Host "Run 'notas help' for usage." -ForegroundColor Yellow
        }
    }
}
