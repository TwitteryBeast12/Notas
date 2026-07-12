# Notas Development Progress

## Current Status
- **Runtime**: TypeScript/Node.js (v0.6.0)
- **Python**: Removed entirely
- **Distribution**: Pre-built binaries (`.exe` + Linux) via `pkg`
- **Privacy**: All data stays local in `~/.notas/`

## Completed (v0.6.0)
- [x] Plugin architecture foundation (`plugin.ts`)
- [x] Plugin loader with dynamic imports
- [x] New `notas plugins` command
- [x] Updated `notas export` to support plugins
- [x] Config schema extended with `plugins` field
- [x] PLUGIN_TEMPLATE.md with Confluence example
- [x] Updated RELEASE_v0.6.0.md

## Completed (v0.5.1)
- [x] Fix exportLocal path bug (directory creation)
- [x] Add error handling to diff/merge commands
- [x] Enhanced PII scrubber (env vars, base64 strings)
- [x] Fix config loading consistency in export command
- [x] Updated RELEASE_v0.5.1.md
- [x] Binaries built and uploaded to GitHub Releases
- [x] Installers: add verification step, show version on success, simplify next steps

## Completed (v0.5.0)
- [x] Linux installer script (`install.sh`)
- [x] TUI export functionality (fully working)
- [x] PII scrubbing (passwords, keys, tokens, emails, IPs)
- [x] Updated RELEASE_v0.4.md
- [x] Binaries built and uploaded

## Completed (v0.3.0)
- [x] TUI (interactive terminal UI) with `ink`
- [x] Notion markdown parser (headings, lists, code blocks)
- [x] Windows installer (`install.ps1`)
- [x] PowerShell wrapper fix (removed Export-ModuleMember error)
- [x] Updated RUNNING.md with next steps

## Completed (v0.2.0)
- [x] Port `interpret.py` → `src/interpreter.ts`
- [x] Port `exporter.py` → `src/exporter.ts` (FULL implementation)
- [x] Build CLI with `commander` (`src/cli.ts`)
- [x] Add `notas list` - List all drafts
- [x] Add `notas view <session>` - View draft content
- [x] Add `notas export <session> [github|notion|local]` - Export to platforms
- [x] Add `notas config` - Configure API keys
- [x] Configure `pkg` for single-binary builds
- [x] Generate Windows (`notas-win.exe`) + Linux (`notas-linux`) binaries
- [x] Update `capture.ps1` to call new CLI
- [x] Update README/RUNNING docs

## Completed (v0.1.0)
- [x] TypeScript migration (initial)

## Open TODOs
- [ ] GitHub CDN propagation issue (assets upload but 404 for ~10 min)
- [x] Add unit tests for PII scrubber
- [x] TUI: Add search/filter for drafts
- [ ] Web UI (deferred to v0.6)
- [ ] Support for custom templates
- [ ] Auto-commit to GitHub after export
- [ ] Consider Git LFS for binaries >50MB

## Architecture
- **Capture**: `capture.ps1` calls `notas rec` / `notas stop`
- **Interpret**: Ollama/OpenAI via `interpreter.ts`
- **Export**: `exporter.ts` handles GitHub/Notion/Local
- **Storage**: `~/.notas/sessions/` (raw), `~/.notas/drafts/` (AI output)

## Release History
- **v0.6.0** (2026-04-30): Plugin system - community exporters
- **v0.5.1** (2026-04-30): Bugfix - export path, error handling, PII scrubber
- **v0.5.0** (2026-04-20): Auto-export, session diff/merge, docs
- **v0.4.0** (2026-04-20): Linux installer, TUI export, PII scrubbing
