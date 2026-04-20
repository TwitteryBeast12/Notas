# Notas Development Progress

## Current Status
- **Runtime**: TypeScript/Node.js (v0.1.0)
- **Python**: Removed entirely
- **Distribution**: Pre-built binaries (`.exe` + Linux) via `pkg`
- **Privacy**: All data stays local in `~/.notas/`

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
- [ ] Build TUI in TypeScript (replace `textual`)
- [ ] Build Web UI (replace FastAPI)
- [ ] Implement full export logic (GitHub/Notion APIs currently placeholder)
- [ ] Add PII scrubbing logic to interpreter
- [ ] Test binaries on fresh Windows/Linux machines

## Architecture
- **Capture**: `capture.ps1` calls `notas rec` / `notas stop`
- **Interpret**: Ollama/OpenAI via `interpreter.ts`
- **Export**: `exporter.ts` handles GitHub/Notion/Local
- **Storage**: `~/.notas/sessions/` (raw), `~/.notas/drafts/` (AI output)

## Release History
- **v0.1.0** (2026-04-20): TypeScript Migration. No Python required.
