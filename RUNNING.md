# How to Run Notas

## 🚀 Quick Start

### Windows (One-Line Install)
```powershell
irm https://raw.githubusercontent.com/TwitteryBeast12/Notas/main/install.ps1 | iex
```
**What it does:** Downloads latest release, installs to PATH, creates PowerShell wrapper, shows next steps.

**After install:**
1. Close and reopen PowerShell
2. Run: `notas --help`
3. Run: `notas config` (set up AI provider + export keys)
4. Record your first session:
   ```powershell
   notas rec "my-task"
   # ... do your work ...
   notas stop "my-task"
   ```

### Linux (One-Line Install)
```bash
curl -fsSL https://raw.githubusercontent.com/TwitteryBeast12/Notas/main/install.sh | bash
```
**After install:**
1. Run: `source ~/.bashrc` (or restart terminal)
2. Run: `notas --help`
3. Run: `notas config`
4. Record: `notas rec "my-task"` → work → `notas stop "my-task"`

---

## 📦 Manual Installation

### Windows (Manual)
1. Download `notas-win.exe` from [Releases](https://github.com/TwitteryBeast12/Notas/releases/latest)
2. Place in: `%LOCALAPPDATA%\Programs\Notas\notas.exe`
3. Add that folder to your PATH
4. Verify: `notas --help`

### Linux (Manual)
```bash
# Download
curl -LO https://github.com/TwitteryBeast12/Notas/releases/latest/download/notas-linux

# Install
chmod +x notas-linux
sudo mv notas-linux /usr/local/bin/notas

# Verify
notas --help
```

### From Source (Development)
```bash
git clone https://github.com/TwitteryBeast12/Notas.git
cd Notas
npm install
npm run build
npm link  # Makes 'notas' globally available
```

---

## ⚙️ Initial Setup

**First time only:**
```bash
notas config
```
This creates `~/.notas/config.json`. Edit it to set:

```json
{
  "provider": "ollama",
  "ollama": {
    "url": "http://localhost:11434",
    "model": "llama3"
  },
  "github": {
    "repo": "yourusername/your-repo",
    "token": "ghp_xxx..."
  },
  "notion": {
    "page_id": "your-page-id",
    "token": "secret_xxx..."
  }
}
```

**Defaults:**
- Provider: `ollama` (local, free)
- Model: `llama3`
- GitHub/Notion: Empty (export to local only until configured)

---

## 📝 Workflow: Capture a Task

### Step 1: Start Recording
```bash
notas rec "server-migration"
```
Output:
```
📝 Recording started: session_server-migration
   Commands: ~/.notas/sessions/session_server-migration.json
   Output: ~/.notas/sessions/session_server-migration.txt
   Run 'notas stop server-migration' when finished.
```

### Step 2: Do Your Work
Run commands as normal in your terminal. Everything is being logged.

### Step 3: Stop Recording
```bash
notas stop "server-migration"
```
Output:
```
⏹️  Recording stopped: session_server-migration
🤖 Generating draft...
✅ Draft generated: ~/.notas/drafts/session_server-migration_runbook.md
   Review with: notas list
```

**What happens:**
- AI analyzes your commands + output
- Groups related commands into logical steps
- Generates a professional runbook
- **Auto-scrubs PII** (passwords, keys, tokens, emails, IPs)

---

## 👀 Review & Export

### List All Drafts
```bash
notas list
```
```
📝 Available Drafts:

  1. session_server-migration_runbook.md (Session: server-migration, Type: runbook)
  2. session_db-backup_runbook.md (Session: db-backup, Type: runbook)

Export with: notas export <sessionId> [github|notion|local]
```

### View a Draft
```bash
notas view "server-migration"
```
Shows the full markdown content in your terminal.

### Interactive TUI (Recommended)
```bash
notas review
```
**Controls:**
- `↑` `↓` - Navigate drafts
- `Enter` - View draft
- `E` - Export (choose GitHub/Notion/Local)
- `ESC` - Go back / Exit

**Export from TUI:**
1. Select draft → Press `Enter`
2. Press `E` to export
3. Choose target (↑/↓ + Enter):
   - **Local** → Saves to `~/.notas/final/`
   - **GitHub** → Pushes to your repo (requires config)
   - **Notion** → Creates page (requires config)

### Export via CLI
```bash
# Export to local file
notas export "server-migration" local

# Export to GitHub
notas export "server-migration" github

# Export to Notion
notas export "server-migration" notion
```

---

## 📁 File Locations

| Type | Path |
|------|------|
| Config | `~/.notas/config.json` |
| Session Logs (raw) | `~/.notas/sessions/` |
| AI Drafts | `~/.notas/drafts/` |
| Final Exports | `~/.notas/final/` |
| Templates | `~/.notas/templates/` |

---

## 🔒 PII Protection

Notas automatically scrubs sensitive data from drafts:

**Before (your terminal):**
```bash
mysql -u admin -pSuperSecret123
curl -H "Authorization: Bearer eyJhbGciOiJIUzI1NiJ9..."
export AWS_SECRET_ACCESS_KEY=wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY
```

**After (in draft):**
```bash
mysql -u admin -p[REDACTED]
curl -H "Authorization: Bearer [REDACTED]"
export AWS_SECRET_ACCESS_KEY=[REDACTED]
```

**What gets scrubbed:**
- Passwords (`password=`, `-p`, `passwd`)
- API keys, tokens, secrets
- AWS credentials
- Bearer tokens
- Private keys
- Email addresses
- IP addresses

---

## 🛠️ PowerShell Wrapper (Windows)

The installer creates a wrapper script at:
```
$HOME\Documents\WindowsPowerShell\notas-wrapper.ps1
```

**Load it in your profile or run:**
```powershell
. $HOME\Documents\WindowsPowerShell\notas-wrapper.ps1

# Now you can use:
Start-NotasCapture "my-task"
# ... work ...
Stop-NotasCapture
```

**Aliases created:**
- `notas-rec` → `Start-NotasCapture`
- `notas-stop` → `Stop-NotasCapture`

---

## ❓ Troubleshooting

**"notas: command not found"**
- Windows: Reopen PowerShell, or check PATH has `%LOCALAPPDATA%\Programs\Notas`
- Linux: Run `source ~/.bashrc` or add `~/.local/bin` to PATH

**"Config not found"**
- Run `notas config` to generate it

**"Export failed: missing token"**
- Edit `~/.notas/config.json` and add your GitHub/Notion tokens

**Drafts look wrong**
- Check `~/.notas/templates/runbook.md` for template format
- AI uses Ollama by default; ensure it's running (`ollama serve`)

---

## 📚 Next Steps

1. **Customize templates**: Edit `~/.notas/templates/runbook.md`
2. **Set up exports**: Add GitHub/Notion tokens to config
3. **Automate**: Add `Start-NotasCapture` to your profile for auto-recording
4. **Share**: Export runbooks to your team's wiki or GitHub repo
