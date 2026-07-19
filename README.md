# Notas

Turn terminal chaos into professional docs. Essential for runbooks, training, and knowledge sharing.

## The Core Pain
Engineers hate writing docs. Runbooks go stale, wikis stay empty, knowledge stays in heads. The people who know the most document the least.

## How It Works: Four-Stage Pipeline

Notas transforms raw terminal sessions into structured knowledge:

### 1. Local Capture 
Instead of manually taking notes, you start a recording session with `notas start <session-name>` (or the legacy `notas rec`). The tool hooks into the terminal session to record every command and its corresponding output. 

**How capture loads (important):** Notas records by sourcing a small shell script into your *current* interactive shell (the same way the PowerShell version loads via `$PROFILE`). Because a CLI process cannot modify its parent shell, `notas start` prints the exact line to run — copy/paste it into the shell you want to record:
```bash
NOTAS_REC_CALLED=1 NOTAS_REC_SESSION=server-migration source ~/.notas/capture_bash.sh
```
Or auto-load it for every new shell once: `echo 'source ~/.notas/capture_bash.sh' >> ~/.bashrc`. Then run `notas start` to begin. `cd` and other commands are all captured. Stop with `notas stop <session-name>` (and `stop_notas_capture` in the shell if it's still active).
- **Privacy First**: All data stays in `~/.notas/sessions/`. No cloud upload.
- **Noise Reduction**: It automatically filters out redundant commands (like repeated `ls` or `clear`) to keep the signal high.

### 2. AI Interpretation 
Once stopped (`notas stop <session-name>`), the raw logs are fed into a local LLM (via Ollama) or a cloud provider. The AI doesn't just transcribe; it **interprets**. It looks at the sequence of commands to deduce the *intent*—turning a series of `ipconfig` and `netstat` calls into a "Network Troubleshooting Step."

### 3. Draft Generation 
The AI maps the interpreted steps onto a specific template (Runbook, Wiki, or README). It checks your previous documents to maintain a consistent technical style and terminology.
- **Result**: A professional Markdown draft saved to `~/.notas/drafts/`.

### 4. Human Review & Export 
No AI doc is shipped raw. You use the **CLI** or **TUI** to:
- Review the AI's assumptions.
- Edit technical details or add missing context.
- **Export** to GitHub, Notion, or local archive.
- **PII Protection**: All drafts are auto-scrubbed of passwords, API keys, tokens, emails, and IPs.

## Getting Started

**Quick install (Windows):**
```powershell
irm https://raw.githubusercontent.com/TwitteryBeast12/Notas/main/install.ps1 | iex
```

**Quick install (Linux):**
```bash
curl -fsSL https://raw.githubusercontent.com/TwitteryBeast12/Notas/main/install.sh | bash
```

**Latest release:** v0.6.2 - [Release Notes](RELEASE_v0.6.2.md)

**New:** Plugin system - build custom exporters for Confluence, GitLab, S3, etc. See [PLUGIN_TEMPLATE.md](PLUGIN_TEMPLATE.md).

See [QUICKSTART.md](QUICKSTART.md) for full installation and usage guide.

