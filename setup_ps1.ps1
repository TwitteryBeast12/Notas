# Notas PowerShell Setup
# Run this once to add the 'notas' command to your PowerShell profile and initialize secure config.

$ProfilePath = $PROFILE
if (-not (Test-Path $ProfilePath)) {
    New-Item -Path $ProfilePath -ItemType File -Force | Out-Null
}

# Define the global 'notas' function
$NotasFunc = @'
function notas {
    param([string]$Action, [string]$Name = "session")
    
    switch ($Action) {
        "rec" {
            Write-Host "Notas: Starting recording session..." -ForegroundColor Green
            # Import the capture script if not loaded
            if (-not (Get-Command Start-NotasCapture -ErrorAction SilentlyContinue)) {
                $captureScript = "$HOME\.notas\capture.ps1"
                if (Test-Path $captureScript) {
                    . $captureScript
                } else {
                    Write-Error "Capture script not found at $captureScript"
                    return
                }
            }
            Start-NotasCapture
        }
        "tui" {
            Write-Host "Notas: Opening Review TUI..." -ForegroundColor Green
            # Ensure we call python3 for the TUI
            python3 "$HOME\.notas\tui.py"
        }
        Default {
            Write-Host "Usage: notas {rec [name]|tui}" -ForegroundColor Yellow
        }
    }
}
'@

# 1. Add function to profile
if (-not (Select-String -Path $ProfilePath -Pattern "function notas")) {
    Add-Content -Path $ProfilePath -Value $NotasFunc
    Write-Host "Notas aliases added to PowerShell profile." -ForegroundColor Green
}

# 2. Initialize Secure Config Directory
$ConfigDir = "$HOME\.notas"
if (-not (Test-Path $ConfigDir)) {
    New-Item -ItemType Directory -Path $ConfigDir -Force | Out-Null
}

# 3. Initial Config File (if missing)
$ConfigPath = Join-Path $ConfigDir "config.json"
if (-not (Test-Path $ConfigPath)) {
    $DefaultConfig = @{
        provider = "ollama"
        ollama = @{ url = "http://localhost:11434"; model = "llama3" }
        openai = @{ api_key = ""; model = "gpt-4" }
        anthropic = @{ api_key = ""; model = "claude-3-opus" }
    }
    $DefaultConfig | ConvertTo-Json -Depth 10 | Out-File -FilePath $ConfigPath -Encoding utf8
    
    # Set strict permissions (Read/Write for User only)
    # In Windows, we use ACLs to mimic chmod 600
    $Acl = Get-Acl $ConfigPath
    $Acl.SetAccessRuleProtection($true, $false) # Disable inheritance
    $CurrentIdentity = [System.Security.Principal.WindowsIdentity]::GetCurrent().Name
    $AccessRule = New-Object System.Security.AccessControl.FileSystemAccessRule($CurrentIdentity, "FullControl", "Allow")
    $Acl.SetAccessRule($AccessRule)
    Set-Acl $ConfigPath $Acl
    Write-Host "Secure config initialized at $ConfigPath" -ForegroundColor Green
}

Write-Host "Setup complete. Please restart your shell or run: . `$PROFILE" -ForegroundColor Cyan
