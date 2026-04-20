# Notas Release v0.3.0 - TUI + Better Notion Export

## What's New
- **🖥️ TUI (Terminal UI)**: Interactive draft browser with `notas review`
  - Arrow keys to navigate
  - Enter to view drafts
  - E to export
  - ESC to go back/exit
- **📝 Notion Export Upgrade**: Proper markdown parsing
  - Headings (`#`, `##`, `###`) → Notion headings
  - Lists (`-`, `*`, `1.`) → Bulleted/numbered lists
  - Code blocks (```) → Notion code blocks with syntax highlighting
  - Paragraphs → Rich text blocks
- **📦 Windows Installer**: One-line install script
  ```powershell
  irm https://raw.githubusercontent.com/TwitteryBeast12/Notas/main/install.ps1 | iex
  ```
- **🔧 PowerShell Wrapper Fixed**: No more `Export-ModuleMember` error
- **📚 Updated Docs**: Complete RUNNING.md with next steps

## Installation
### Windows (New Users)
```powershell
irm https://raw.githubusercontent.com/TwitteryBeast12/Notas/main/install.ps1 | iex
```
*Installs notas, adds to PATH, creates PowerShell wrapper, shows next steps.*

### Upgrade (Existing Users)
1. Download new `notas-win.exe` from this release
2. Replace old executable in PATH
3. Run `notas review` to try the new TUI!

## Usage
```bash
# Interactive TUI
notas review

# Export to Notion (now with proper formatting!)
notas export "my-session" notion

# List all drafts
notas list
```

## Fixed Issues
- ❌ "Export-ModuleMember" PowerShell error → ✅ Removed (was only for .psm1 modules)
- ❌ Notion export was plain text → ✅ Proper markdown parsing (headings, lists, code)
- ❌ No install instructions → ✅ One-line installer + clear next steps

## Binaries
- `notas-win.exe` (49MB) - Windows x64
- `notas-linux` (58MB) - Linux x64
