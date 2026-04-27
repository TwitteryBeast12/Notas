# Notas Release v0.5.0 - Auto-Export + Session Tools

## What's New
- **🚀 Auto-Export**: Set it and forget it - drafts export automatically after `notas stop`
  ```json
  // ~/.notas/config.json
  "autoExport": {
    "enabled": true,
    "target": "github"  // or "notion" or "local"
  }
  ```
- **📊 Session Diff**: Compare two sessions to see what changed
  ```bash
  notas diff "session1" "session2"
  ```
- **🔀 Session Merge**: Combine multiple sessions into one document
  ```bash
  notas merge "session1" "session2" "session3" -o "full-project"
  ```
- **🔌 Plugin Foundation**: groundwork for custom exporters (coming in v0.6)

## Usage Examples

### Auto-Export Setup
```bash
notas config
# Edit config.json to add:
# "autoExport": { "enabled": true, "target": "github" }
```

Now every `notas stop` automatically pushes to GitHub.

### Compare Sessions
```bash
# See what commands differed between two troubleshooting sessions
notas diff "db-issue-morning" "db-issue-afternoon"
```

### Merge Related Sessions
```bash
# Combine all sessions from a multi-day migration
notas merge "day1-setup" "day2-migration" "day3-testing" -o "full-migration-runbook"
```

## Installation
### Windows
```powershell
irm https://raw.githubusercontent.com/TwitteryBeast12/Notas/main/install.ps1 | iex
```

### Linux
```bash
curl -fsSL https://raw.githubusercontent.com/TwitteryBeast12/Notas/main/install.sh | bash
```

### Manual Download
- `notas-win.exe` (49MB)
- `notas-linux` (58MB)

## Fixed Issues
- Better Ollama error messages (connection refused, timeout)
- PII scrubber now catches SSH keys and database connection strings
- Version bump to match release tags

## What's Next (v0.6)
- Web UI for browser-based editing
- Custom templates (define your own runbook formats)
- Full plugin system (Confluence, GitLab, custom exporters)
- TUI search/filter
