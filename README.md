# Notas

Improve your Powershell knowledge AND documentation. Essential for documentation and training the newbies on the why and what.

## The Core Pain
Engineers spend hours writing docs they hate writing. Runbooks go stale, wikis are empty, and institutional knowledge lives in people's heads. The people who know the most are the least likely to document it.

## How It Works: The Pipeline

Notas transforms raw terminal chaos into structured knowledge using a four-stage pipeline:

### 1. Stealth Capture (The Log)
Instead of manually taking notes, you run `notas rec`. The tool hooks into the terminal session to record every command and its corresponding output. 
- **Privacy First**: All data stays in `~/.notas/sessions/`. No cloud upload.
- **Noise Reduction**: It automatically filters out redundant commands (like repeated `ls` or `clear`) to keep the signal high.

### 2. AI Interpretation (The Brain)
Once stopped, the raw logs are fed into a local LLM (via Ollama) or a cloud provider. The AI doesn't just transcribe; it **interprets**. It looks at the sequence of commands to deduce the *intent*—turning a series of `ipconfig` and `netstat` calls into a "Network Troubleshooting Step."

### 3. Draft Generation (The Template)
The AI maps the interpreted steps onto a specific template (Runbook, Wiki, or README). It checks your previous documents to maintain a consistent technical style and terminology.
- **Result**: A professional Markdown draft saved to `~/.notas/drafts/`.

### 4. Human Review & Export (The Final Touch)
No AI doc is shipped raw. You use the **TUI** or **Web UI** to:
- Review the AI's assumptions.
- Edit technical details or add missing context.
- **Promote** the draft to a final destination: GitHub, Notion, or a local archive.

## Getting Started
See [RUNNING.md](RUNNING.md) for installation and execution steps.

