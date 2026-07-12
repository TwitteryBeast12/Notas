# Notas Release v0.6.1 - Templates, Search & Local Vault

## What's New

This release rounds out the local-first documentation workflow: reusable
export **templates**, **full-text search** over your drafts, and a **private
local git vault** that auto-versions every runbook you generate.

### 📝 Custom Export Templates

You can now render a draft through a named template (or your own file) before
exporting.

- `notas export <sessionId> <target> --template <name|path>` — `<name>` resolves
  to `./templates/<name>.md`; a path uses your own file.
- Bundled templates: `runbook` (now carries `Session:` / `Date:` header
  placeholders), `wiki`, `jira`.
- `{{sessionId}}` and `{{date}}` are substituted automatically; any `{{key}}`
  in your template is filled from the vars you pass.
- `src/template.ts` exposes `renderTemplate()`, `listTemplates()`,
  `defaultVars()` if you want to script it.

```bash
# Export using the built-in wiki template
notas export my-session local --template wiki

# Or your own format
notas export my-session local --template ~/templates/incident.md
```

### 🔍 Full-Text Draft Search

The TUI draft list now searches draft **content**, not just filenames.

- In `notas review`, just start typing — matches commands/notes inside the
  draft body, not only the file name. `ESC` clears the filter.
- `src/draftFilter.ts` adds `searchDrafts(drafts, query, getContent?)` (pure,
  testable); the old filename-only `filterDrafts` is retained.

### 🔒 Local Git Vault (Auto-Commit, Private by Default)

Every generated draft can be versioned in a private git repo on your machine.
**Nothing leaves your computer unless you explicitly configure a remote.**

- `notas git init` — creates `~/.notas/vault/` as a git repo (idempotent).
- `notas git status` — shows branch and commit count.
- `notas git push <remote>` — pushes **only** when you pass a remote URL.
  Without one, it reports the drafts stay local-only.
- `notas stop <session>` auto-commits the new draft when `config.git.enabled`
  is `true` (off by default). Unchanged drafts are not re-committed, so the
  history stays clean.
- Drafts are PII-scrubbed *before* they are written, so the vault never
  contains secrets.

```bash
notas git init
# ... generate drafts with `notas rec` / `notas stop` ...
notas git status
# Optional, only if you want a backup off-machine:
notas git push git@github.com:you/notas-vault.git
```

## Configuration

`notas config` now seeds a `git` block (opt-in):

```json
{
  "provider": "ollama",
  "ollama": { "url": "http://localhost:11434", "model": "llama3" },
  "github": { "repo": "", "token": "" },
  "notion": { "page_id": "", "token": "" },
  "plugins": {},
  "git": { "enabled": false }
}
```

Enable auto-commit by setting `"git": { "enabled": true }`. To push off-machine,
add `"remote": "<url>"` and run `notas git push`.

## Installation

Notas installs by **building from source** (no prebuilt binaries — `pkg` cannot
bundle this ESM project). The installers clone, install, and build, then verify.

**Windows:**
```powershell
irm https://raw.githubusercontent.com/TwitteryBeast12/Notas/main/install.ps1 | iex
```

**Linux:**
```bash
curl -fsSL https://raw.githubusercontent.com/TwitteryBeast12/Notas/main/install.sh | bash
```

## Also in this release (from v0.6.1 batch)

- **Security:** removed the unused `ws` dependency (3 CVEs), bumped `axios` to
  1.18.1, pinned transitive `ws@8.21.0` + `form-data@4.0.6`. `npm audit
  --audit-level=high` is clean.
- **Tests + CI:** Vitest suite added (PII scrubber, draft filter, templates,
  git vault) — 17 tests. CI now fails the build on test failure.
- **Build:** `tsconfig` switched to `Node16` so `node dist/cli.js` runs as real
  ESM; installers build from source and verify before finishing.
- **Repo hygiene:** `node_modules`/`dist` untracked via `.gitignore`; version
  aligned to 0.6.1.

## Breaking Changes

**None for end users.** The old `pkg` release binaries were removed from GitHub
Releases (they were non-functional for this ESM project); installers now build
from source instead.

## What's Next

- [ ] Web UI for browser-based editing (deferred)
- [ ] Git LFS for binaries >50MB (if/when needed)
- [ ] More bundled templates & a template authoring guide

## Full Changelog

https://github.com/TwitteryBeast12/Notas/compare/v0.6.0...v0.6.1
