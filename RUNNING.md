# How to Run Notas

## 1. Install Prerequisites
- **PowerShell 5.1+**
- **Python 3.10+**
- **Dependencies**: 
  ```bash
  pip install fastapi uvicorn jinja2 python-multipart textual requests
  ```

## 2. Installation & Setup
### For Windows (PowerShell)
Run the setup script to configure your environment and preferences:
```powershell
.\setup_ps1.ps1
```
*The setup script will ask for your preferred interface (TUI or Web) and your AI provider settings.*

### For Linux/macOS (Bash)
Run the setup script to add the `notas` command to your shell:
```bash
bash ~/.notas/setup_bash.sh
source ~/.bashrc
```

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
