# Notas - Quick Start Guide

## What is Notas?
Turns your terminal sessions into professional documentation automatically. Records commands → AI generates runbooks → Export to GitHub/Notion.

---

## Install (Choose One Method)

### Method 1: Install Script (Easiest)

**Windows (PowerShell as Admin):**
```powershell
irm https://raw.githubusercontent.com/TwitteryBeast12/Notas/main/install.ps1 | iex
```
*Installas notas.exe, adds to PATH, creates PowerShell wrapper.*

**Linux (Bash):**
```bash
curl -fsSL https://raw.githubusercontent.com/TwitteryBeast12/Notas/main/install.sh | bash
```
*Installs notas to ~/.local/bin, adds to PATH.*

### Method 2: Manual Download

**Windows:**
1. Download `notas-win.exe` from [Releases](https://github.com/TwitteryBeast12/Notas/releases/latest)
2. Save to: `%LOCALAPPDATA%\Programs\Notas\notas.exe`
3. Add that folder to your PATH
4. Open new PowerShell: `notas --help`

**Linux:**
```bash
# Download
curl -LO https://github.com/TwitteryBeast12/Notas/releases/latest/download/notas-linux

# Install
chmod +x notas-linux
sudo mv notas-linux /usr/local/bin/notas

# Verify
notas --help
```

### Method 3: From Source (Developers)
```bash
git clone https://github.com/TwitteryBeast12/Notas.git
cd Notas
npm install
npm run build
npm link
```

---

## First-Time Setup

**1. Generate config:**
```bash
notas config
```
Creates `~/.notas/config.json`

**2. Edit config** (optional - defaults work for local Ollama):
```json
{
  "provider": "ollama",
  "ollama": {
    "url": "http://localhost:11434",
    "model": "llama3"
  },
  "autoExport": {
    "enabled": false,
    "target": "local"
  }
}
```

**3. Start Ollama** (if using local AI):
```bash
ollama serve
ollama pull llama3
```

---

## Basic Usage

### Record a Session (Linux)

Notas captures by sourcing a script into your **current interactive shell** (a CLI can't modify its parent shell). `notas start` prints the exact line to run:

```bash
notas start "server-migration"
# → copy/paste the printed line into the shell you want to record:
NOTAS_REC_CALLED=1 NOTAS_REC_SESSION=server-migration source ~/.notas/capture_bash.sh
```

Now run your commands as normal — `cd`, pipes, interactive tools, all captured.

*(Optional, one-time):* auto-load capture for every new shell:
```bash
echo 'source ~/.notas/capture_bash.sh' >> ~/.bashrc
```
Then just run `notas start "server-migration"` to begin.

### Record a Session (Windows / PowerShell)

Load the capture module into your profile once, then start:
```powershell
. "$HOME\.notas\capture.ps1"
notas start "server-migration"
```

### Stop Recording
```bash
notas stop "server-migration"
```
Output:
```
Recording stopped: session_server-migration
Generating draft...
Draft generated: ~/.notas/drafts/session_server-migration_runbook.md
```
If the shell still shows as recording, run `stop_notas_capture` in that shell.

> **Note:** `notas rec <name>` is kept as a legacy alias for `notas start`.

### View Drafts
```bash
notas list
```

### Read a Draft
```bash
notas view "server-migration"
```

### Export
```bash
# Save locally
notas export "server-migration" local

# Push to GitHub (requires config)
notas export "server-migration" github

# Push to Notion (requires config)
notas export "server-migration" notion
```

---

## Advanced Features

### Interactive TUI
```bash
notas review
```
- Arrow keys: Navigate
- Enter: View draft
- E: Export
- ESC: Back/Exit

### Compare Sessions
```bash
notas diff "session1" "session2"
```
Shows commands that differ between two sessions.

### Merge Sessions
```bash
notas merge "day1" "day2" "day3" -o "full-project"
```
Combines multiple sessions into one document.

### Auto-Export
Edit `~/.notas/config.json`:
```json
{
  "autoExport": {
    "enabled": true,
    "target": "github"
  }
}
```
Now `notas stop` automatically pushes to GitHub.

---

## File Locations

| Type | Path |
|------|------|
| Config | `~/.notas/config.json` |
| Sessions (raw) | `~/.notas/sessions/` |
| Drafts | `~/.notas/drafts/` |
| Exports | `~/.notas/final/` |

---

## Troubleshooting

**"notas: command not found"**
- Windows: Reopen PowerShell, or check PATH has `%LOCALAPPDATA%\Programs\Notas`
- Linux: Run `source ~/.bashrc` or add `~/.local/bin` to PATH

**"Ollama Error: Connection refused"**
- Run: `ollama serve`
- Check config: `notas config`

**"Config not found"**
- Run: `notas config` to create it

**Drafts look wrong**
- Check Ollama is running: `ollama list`
- Try different model in config

**"Capture isn't recording anything" (Linux)**
- `notas start` only *prints* the source line — you must run it in the shell you want to capture.
- Verify the script is present: `ls ~/.notas/capture_bash.sh`
- Confirm capture is active in that shell: `echo $NOTAS_SESSION_ACTIVE` (should be `true`). If not, re-run the `NOTAS_REC_CALLED=1 ... source ...` line `notas start` printed.
- After stopping, the session lock is `~/.notas/active_session.json`; remove it if stale.

---

## Next Steps

1. **Customize templates**: Edit `~/.notas/templates/runbook.md`
2. **Enable auto-export**: Set `"autoExport": { "enabled": true }` in config
3. **Share runbooks**: Export to your team's GitHub or Notion

**Full docs:** https://github.com/TwitteryBeast12/Notas
