# Notas Release v0.4.0 - Linux Installer + TUI Export + PII Scrubbing

## What's New
- **🐧 Linux Installer Script**: One-line install for Linux
  ```bash
  curl -fsSL https://raw.githubusercontent.com/TwitteryBeast12/Notas/main/install.sh | bash
  ```
- **🚀 TUI Export Complete**: Press `E` in TUI to actually export (GitHub/Notion/Local)
- **🔒 PII Scrubbing**: Auto-redacts passwords, API keys, tokens, emails, IPs before saving drafts
  - Passwords: `password=secret123` → `password=[REDACTED]`
  - API Keys: `api_key: abc123` → `api_key: [REDACTED]`
  - AWS Keys, Bearer tokens, Private keys, Emails, IP addresses
- **📦 Updated Binaries**: Smaller, faster builds

## Installation
### Windows
```powershell
irm https://raw.githubusercontent.com/TwitteryBeast12/Notas/main/install.ps1 | iex
```

### Linux (NEW!)
```bash
curl -fsSL https://raw.githubusercontent.com/TwitteryBeast12/Notas/main/install.sh | bash
```

### Manual
Download from this release:
- `notas-win.exe` (49MB)
- `notas-linux` (58MB)

## PII Scrubbing Examples
Before:
```bash
mysql -u admin -pSuperSecret123
curl -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
export AWS_SECRET_ACCESS_KEY=wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY
```

After (in draft):
```bash
mysql -u admin -p[REDACTED]
curl -H "Authorization: Bearer [REDACTED]"
export AWS_SECRET_ACCESS_KEY=[REDACTED]
```

## TUI Export
```bash
notas review
# Select draft → Enter → E → Choose target → Enter
```

## Fixed Issues
- ❌ TUI export was placeholder → ✅ Fully functional
- ❌ No Linux installer → ✅ `install.sh` added
- ❌ Sensitive data in drafts → ✅ Auto-scrubbed
