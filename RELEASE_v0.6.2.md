# Notas Release v0.6.2 - Installer Cleanup & Fixes

## What's New

A maintenance release focused on the build-from-source installers. No app
behavior changed — your recordings, drafts, and exports are unaffected.

### Installer fixes (`install.sh`)

- **Emoji removed** from all installer output. The script now prints plain
  text, which is friendlier for logs, CI, and terminals without emoji fonts.
- **`esbuild` postinstall handled.** When npm's `allowScripts` lockdown is
  active, esbuild's native-binary download is blocked and the build can emit a
  broken `dist`. The installer now approves + rebuilds `esbuild` before
  `npm run build`. The step is guarded so it stays a no-op on npm versions
  without the feature.
- **`curl | bash` no longer aborts.** The interactive PATH prompt is skipped
  when stdin is not a TTY, so the install completes (exit 0) and prints
  "Installation complete!" instead of dying on `read`.

## Installation

Same as before — build from source, no prebuilt binaries:

**Windows:**
```powershell
irm https://raw.githubusercontent.com/TwitteryBeast12/Notas/main/install.ps1 | iex
```

**Linux:**
```bash
curl -fsSL https://raw.githubusercontent.com/TwitteryBeast12/Notas/main/install.sh | bash
```

## Also in this release

- **Version:** bumped to `0.6.2` (`package.json` + `package-lock.json`).
- **README:** "Latest release" line corrected from the stale `v0.6.0`.

## Breaking Changes

**None.**

## What's Next

- [ ] Web UI for browser-based editing (deferred)
- [ ] Git LFS for binaries >50MB (if/when needed)
- [ ] More bundled templates & a template authoring guide

## Full Changelog

https://github.com/TwitteryBeast12/Notas/compare/v0.6.1...v0.6.2
