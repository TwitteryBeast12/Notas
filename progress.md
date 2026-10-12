# Notas Development Progress

## Current Status
- **Runtime**: TypeScript/Node.js (v0.6.2)
- **Python**: Removed entirely
- **Distribution**: Installed by building from source (`install.sh` / `install.ps1` clone + `npm install` + `npm run build`). No prebuilt binaries (pkg can't bundle this ESM project).
- **Privacy**: All data stays local in `~/.notas/`; the git vault is local-only unless a remote is explicitly configured.

## Completed (v0.6.0)
- [x] Plugin architecture foundation (`plugin.ts`)
- [x] Plugin loader with dynamic imports
- [x] New `notas plugins` command
- [x] Updated `notas export` to support plugins
- [x] Config schema extended with `plugins` field
- [x] PLUGIN_TEMPLATE.md with Confluence example
- [x] Updated RELEASE_v0.6.0.md

## Completed (v0.6.1)
- [x] Custom export templates (`src/template.ts`, `notas export --template <name|path>`, `{{sessionId}}/{{date}}` substitution)
- [x] Full-text draft search (TUI + `searchDrafts` in `draftFilter.ts`)
- [x] Auto-commit drafts to a local git vault (`src/gitStore.ts`, `notas git init|status|push`); private by default, optional remote push
- [x] Build fixed for ESM (`tsconfig` Node16); installers build from source

## Completed (v0.6.2)
- [x] Installer cleanup: emoji stripped from output, esbuild postinstall approved under npm allowScripts, `curl | bash` no longer aborts without a TTY
- [x] Fixed broken `rec` on Linux (capture_bash.sh now records instead of silently failing)
- [x] Added Anthropic provider (`anthropic` no longer misroutes to the OpenAI client)
- [x] `notas stop` accepts `--type runbook|wiki|jira` so the shipped wiki/jira templates are usable
- [x] `--version` reports the correct version; `list` regex no longer splits session names containing underscores
- [x] Provider unit tests (`tests/provider.test.ts`)

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
- [ ] Web UI for browser-based editing (deferred to v0.7)
- [ ] Publish `notas-cli` to npm (would remove the need to build from source on install)
- [ ] Add tests for cli/interpreter/exporter/plugin/template (currently only draftFilter, gitStore, pii, provider are covered)
- [ ] Re-evaluate pinned `overrides` (esbuild 0.28.1 / vite 6.4.3) each release; remove pins once vitest/vite ship patched versions

## Architecture
- **Capture**: `capture.ps1` (Windows) / `capture_bash.sh` (Linux) call `notas start` / `notas stop`
- **Interpret**: Ollama/OpenAI/Anthropic via `interpreter.ts`
- **Export**: `exporter.ts` handles GitHub/Notion/Local (+ community plugins)
- **Storage**: `~/.notas/sessions/` (raw), `~/.notas/drafts/` (AI output)

## Release History
- **v0.6.2** (2026-07-19): Installer cleanup; rec/Anthropic/template fixes (#6, #7, #8)
- **v0.6.1** (2026-07-12): Custom export templates, full-text search, local git vault
- **v0.6.0** (2026-04-30): Plugin system - community exporters
- **v0.5.1** (2026-04-30): Bugfix - export path, error handling, PII scrubber
- **v0.5.0** (2026-04-20): Auto-export, session diff/merge, docs
- **v0.4.0** (2026-04-20): Linux installer, TUI export, PII scrubbing
