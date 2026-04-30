# Notas Release v0.5.1 - Bugfix Release

## Quick Summary
Stability fixes for v0.5.0 - export functionality, error handling, and improved PII protection.

## Fixed Issues

### 🐛 Critical: Local Export Path Bug
**Problem:** `notas export <session> local` was creating nested directories incorrectly.
```bash
# Before (broken): ~/.notas/final/session_name_final.md/  # wrong
# After (fixed):   ~/.notas/final/session_name_final.md   # correct
```

### 🛡️ Session Command Error Handling
**Problem:** `notas diff` and `notas merge` would crash with unhelpful errors if sessions didn't exist.

**Fixed:** Now returns clear error messages:
```bash
$ notas diff "missing-session" "other"
Error: Session not found: missing-session

$ notas merge "day1" "nonexistent" -o "project"
Failed to load session 'nonexistent': Session not found: nonexistent
```

### 🔒 PII Scrubber Gaps
**Added protection for:**
- Environment variable exports: `export AWS_SECRET_ACCESS_KEY=***` → `export [VAR]=[REDACTED]`
- Long base64 strings (40+ chars): API keys, tokens in encoded format

**Example:**
```bash
# Before: export DB_PASSWORD=supersecret123  # visible in logs
# After:  export [VAR]=[REDACTED]            # protected

# Before: AKIAIOSFODNN7EXAMPLEwJalrXUtnFEMI/K7MDENG/bPxRfiCY  # visible
# After:  [BASE64 REDACTED]                                   # protected
```

### ⚙️ Config Loading Consistency
**Problem:** Export command used inconsistent config loading (sometimes empty config, sometimes threw errors).

**Fixed:** All export targets now use unified `loadConfig()` with proper error messages.

## Installation

### Update Existing Install
**Windows:**
```powershell
irm https://raw.githubusercontent.com/TwitteryBeast12/Notas/main/install.ps1 | iex
```

**Linux:**
```bash
curl -fsSL https://raw.githubusercontent.com/TwitteryBeast12/Notas/main/install.sh | bash
```

### Manual Download
- **notas-win.exe** (47MB)
- **notas-linux** (55M)

Download from: https://github.com/TwitteryBeast12/Notas/releases/tag/v0.5.1

## Upgrade Notes
- **No config changes required** - existing configs work as-is
- **No breaking changes** - drop-in replacement for v0.5.0
- **Recommended for all users** - especially if using local export or session merge/diff

## What's Next (v0.6.0)
- Web UI for browser-based editing
- Custom templates (define your own runbook formats)
- Full plugin system (Confluence, GitLab, custom exporters)
- TUI search/filter for drafts

## Full Changelog
https://github.com/TwitteryBeast12/Notas/compare/v0.5.0...v0.5.1
