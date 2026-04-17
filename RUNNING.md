# How to Run Notas

## 1. Install Prerequisites
- **PowerShell 5.1+**
- **Python 3.10+**
- **Dependencies**: `pip install fastapi uvicorn jinja2 python-multipart textual requests`

## 2. Fast Setup (Bash)
Run the setup script to add the `notas` command to your shell:
```bash
bash ~/.notas/setup_bash.sh
source ~/.bashrc
```
Now you can use:
- `notas rec "My Task"` $\rightarrow$ Start recording.
- `notas tui` $\rightarrow$ Open the review interface.

## 3. Manual Execution (PowerShell)
1. Import the capture script:
   ```powershell
   . .\capture.ps1
   ```
2. Start a session:
   ```powershell
   Start-NotasCapture
   ```
3. Stop when done:
   ```powershell
   Stop-NotasCapture
   ```

## 4. Review & Export
1. Run the TUI:
   ```bash
   python3 tui.py
   ```
2. Or run the Web Server:
   ```bash
   python3 app.py
   ```
3. Open browser to `http://127.0.0.1:8000`.
4. Select session $\rightarrow$ Choose Template $\rightarrow$ Export to GitHub/Notion/Local.

## 5. Storage
- **Logs**: `~/.notas/sessions/`
- **Drafts**: `~/.notas/drafts/`
- **Templates**: `~/.notas/templates/`
