# Notas Release v0.2.0 - Full Export + CLI Enhancements

## What's New
- **Full Export Logic**: Export to GitHub, Notion, or Local (no more placeholders!)
- **New Commands**:
  - `notas list` - List all available drafts
  - `notas view <session>` - Preview draft content in terminal
  - `notas export <session> [github|notion|local]` - Push to platform
  - `notas config` - Set up API keys interactively
- **Fixed PowerShell Wrapper**: `capture.ps1` now calls the new CLI correctly
- **Better Error Handling**: Clear messages when config or drafts are missing

## Installation
### Upgrade (Windows)
1. Download new `notas-win.exe` from Releases
2. Replace old `notas.exe` in PATH (usually `C:\\Windows\\System32` or `%LOCALAPPDATA%\\Programs\\notas`)

### Fresh Install
See [RUNNING.md](RUNNING.md)

## Usage Examples
```bash
# Setup (first time only)
notas config

# Record a session
notas rec "server-migration"
# ... do your work ...
notas stop "server-migration"

# List drafts
notas list

# View a draft
notas view "server-migration"

# Export to GitHub (requires config)
notas export "server-migration" github

# Export locally
notas export "server-migration" local
```

## Config Setup
Edit `~/.notas/config.json` or run `notas config`:
```json
{
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

## Fixed Issues
- ❌ "Capture script not found" error → ✅ Now calls CLI directly
- ❌ Export was placeholder → ✅ Full GitHub/Notion API integration

## Known Issues
- TUI (interactive terminal UI) deferred to v0.3
- Markdown parsing for Notion is simplified (plain paragraphs)
