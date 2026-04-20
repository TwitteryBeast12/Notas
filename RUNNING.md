# How to Run Notas

## 1. Install Prerequisites
- **PowerShell 5.1+** (Windows) or **Bash** (Linux/macOS)
- **Node.js 18+** (Recommended: Use `nvm` or install from nodejs.org)

## 2. Installation
### Option A: From Source (Dev)
```bash
cd notas
npm install
npm run build
npm link  # Makes 'notas' command available globally
```

### Option B: Pre-built Binary (Release v0.1)
1. Download `notas-win-x64.exe` (Windows) or `notas-linux-x64` (Linux) from [Releases](https://github.com/TwitteryBeast12/Notas/releases).
2. Place it in your PATH (e.g., `C:\Windows\System32` or `/usr/local/bin`).
3. Rename to `notas` (or `notas.exe`).

## 3. Initial Setup
Run `notas` once to generate the config folder:
```bash
notas --help
```
Edit `~/.notas/config.json` to set your AI provider (Ollama/OpenAI) and export targets.

## 3. Workflow: Capturing a Task
1. **Start Recording**:
   - **PowerShell**: `Start-NotasCapture`
   - **CLI**: `notas rec "Task Name"`
2. **Perform your work** in the terminal as usual.
3. **Stop Recording**:
   - **PowerShell**: `Stop-NotasCapture`
   - **CLI**: `notas stop`

## 4. Review & Export
Once you stop a session, the AI automatically generates a draft in `~/.notas/drafts/`. You can review and refine it using your preferred interface.

### Option A: The TUI (Recommended for speed)
Launch the Terminal User Interface:
```bash
python3 tui.py
```
- **Navigate**: Use arrow keys to select a draft.
- **Edit**: Modify the AI output directly in the editor.
- **Export**: Press `e` to push the final version to GitHub, Notion, or local storage.

### Option B: The Web UI (Recommended for long-form editing)
Start the FastAPI server:
```bash
python3 app.py
```
- **Access**: Open browser to `http://127.0.0.1:8000`.
- **Flow**: Select draft $\rightarrow$ Edit content $\rightarrow$ Click **Export**.

## 5. Configuration & Storage
- **Config File**: `~/.notas/config.json` (UI preferences, AI API keys, GitHub tokens).
- **Session Logs**: `~/.notas/sessions/` (Raw command/output logs).
- **AI Drafts**: `~/.notas/drafts/` (Intermediate Markdown files).
- **Templates**: `~/.notas/templates/` (Define how your runbooks should be structured).

## 6. Export Targets
- **GitHub**: Automatically pushes to the configured repo under `/runbooks/`.
- **Notion**: Creates a new page in the specified parent page.
- **Local**: Saves a finalized `.md` file to `~/.notas/final/`.
