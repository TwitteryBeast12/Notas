# Notas Release v0.1.0 - TypeScript Migration

## What's New
- **No Python Required**: Migrated core logic to TypeScript/Node.js.
- **Single Binary**: Pre-built `.exe` available for Windows/Linux.
- **Faster Install**: Just download and run, or `npm install`.
- **Same Privacy**: All data still stays local in `~/.notas/`.

## Installation
### Option A: Pre-built Binary (Recommended)
1. Download `notas-win-x64.exe` (Windows) or `notas-linux-x64` (Linux).
2. Place in PATH and rename to `notas` (or `notas.exe`).
3. Run `notas --help`.

### Option B: From Source
```bash
git clone https://github.com/TwitteryBeast12/Notas.git
cd Notas
npm install
npm run build
npm link
```

## Usage
```bash
# Start recording
notas rec "my-task"

# Stop and generate draft
notas stop "my-task"

# Review draft
notas review "my-task"
```

## Known Issues (v0.1)
- TUI/Web UI not yet ported (CLI only for now).
- Export logic is placeholder (coming in v0.2).

## Feedback
Report issues on GitHub.
