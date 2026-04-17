# How to Run Notas

## 1. Install Prerequisites
- **PowerShell 5.1+**
- **Python 3.10+**
- **FastAPI & Uvicorn**: `pip install fastapi uvicorn jinja2 python-multipart`

## 2. Start Capturing (PowerShell)
1. Open PowerShell.
2. Import the capture script:
   ```powershell
   . .\capture.ps1
   ```
3. Start a session:
   ```powershell
   Start-NotasCapture
   ```
4. Perform your tasks. When done, stop:
   ```powershell
   Stop-NotasCapture
   ```

## 3. Generate & Review (AI/UI)
1. Run the review server:
   ```bash
   python app.py
   ```
2. Open your browser to `http://127.0.0.1:8000`.
3. Select your session $\rightarrow$ Edit the AI draft $\rightarrow$ Save as Markdown.

## 4. Storage
- **Logs**: `~/.notas/sessions/`
- **Drafts**: `~/.notas/drafts/`
