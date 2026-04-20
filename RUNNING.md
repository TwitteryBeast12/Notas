# How to Run Notas

## Quick Start (Windows)
**One-Line Install:**
```powershell
irm https://raw.githubusercontent.com/TwitteryBeast12/Notas/main/install.ps1 | iex
```
*Downloads latest release, adds to PATH, creates PowerShell wrapper.*

**After install:**
1. Close and reopen PowerShell
2. Run: `notas --help`
3. Run: `notas config` (set up API keys)
4. Record: `notas rec "my-task"` → do work → `notas stop "my-task"`

## Installation

### Option A: Pre-built Binary (Recommended)

**Windows (Manual):**
1. Download `notas-win.exe` from [Releases](https://github.com/TwitteryBeast12/Notas/releases).
2. Place in PATH (e.g., `C:\Windows\System32` or `%LOCALAPPDATA%\Programs\Notas`).
3. Rename to `notas.exe`.

**Linux:**
1. Download `notas-linux` from Releases.
2. `chmod +x notas-linux && sudo mv notas-linux /usr/local/bin/notas`.

### Option B: From Source (Dev)
```bash
cd notas
npm install
npm run build
npm link  # Makes 'notas' command available globally
```

## Initial Setup
Run `notas config` to generate `~/.notas/config.json`. Edit it to set:
- AI provider (Ollama/OpenAI)
- GitHub token (for export)
- Notion token (for export)

## Workflow: Capturing a Task

1. **Start Recording**:
   - **CLI**: `notas rec "Task Name"`
   - **PowerShell**: `Start-NotasCapture` (after loading wrapper)
2. **Perform your work** in the terminal as usual.
3. **Stop Recording**:
   - **CLI**: `notas stop "Task Name"`
   - **PowerShell**: `Stop-NotasCapture`

## Review & Export

**List drafts:**
```bash
notas list
```

**View draft:**
```bash
notas view "Task Name"
```

**TUI (Interactive):**
```bash
notas review
```
- ↑/↓ to select
- Enter to view
- E to export
- ESC to back/exit

**Export:**
```bash
notas export "Task Name" github   # Push to GitHub
notas export "Task Name" notion    # Push to Notion
notas export "Task Name" local     # Save locally
```

## Configuration & Storage
- **Config File**: `~/.notas/config.json`
- **Session Logs**: `~/.notas/sessions/`
- **AI Drafts**: `~/.notas/drafts/`
- **Final Exports**: `~/.notas/final/`

## PowerShell Wrapper
Load the wrapper in your profile or run:
```powershell
. $HOME\Documents\WindowsPowerShell\notas-wrapper.ps1
Start-NotasCapture "my-task"
# ... work ...
Stop-NotasCapture
```
