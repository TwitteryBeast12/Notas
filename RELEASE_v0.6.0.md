# Notas Release v0.6.0 - Plugin System

## What's New

### 🔌 Plugin Architecture (Major Feature)

Notas now supports **community-built exporters** via a plugin system. Instead of waiting for core to add support for your favorite platform, anyone can build and share exporters.

**Built-in exporters** (still available):
- `local` - Save to `~/.notas/final/`
- `github` - Push to GitHub repository
- `notion` - Create Notion pages

**Plugin exporters** (new):
- Install with `npm install -g @notas/plugin-<name>`
- Configure in `~/.notas/config.json`
- Use with `notas export <session> <plugin-name>`

### 📋 New Commands

#### `notas plugins`
List all installed plugins.

```bash
$ notas plugins

No plugins installed.

Install plugins with:
  npm install -g @notas/plugin-<name>

Available plugins: https://www.npmjs.com/search?q=@notas%2Fplugin
```

#### `notas export <session> <plugin>`
Export using a plugin instead of built-in targets.

```bash
# Export to Confluence (if plugin installed)
notas export "my-session" confluence

# Export to GitLab wiki
notas export "my-session" gitlab
```

### 📝 Plugin Template

Created `PLUGIN_TEMPLATE.md` with:
- Complete plugin structure
- Working Confluence exporter example
- Plugin API reference
- Publishing guide

**Example plugin** (Confluence):
```typescript
export default {
  name: 'confluence',
  version: '1.0.0',
  export: async (target, content, config) => {
    // Your export logic here
    return { success: true, url: '...' };
  }
};
```

## Configuration

Add plugins to `~/.notas/config.json`:

```json
{
  "provider": "ollama",
  "ollama": { "url": "http://localhost:11434", "model": "llama3" },
  "plugins": {
    "confluence": {
      "enabled": true,
      "apiUrl": "https://your-domain.atlassian.net/wiki",
      "spaceKey": "RUNBOOKS",
      "username": "you@company.com",
      "apiToken": "your-token"
    }
  }
}
```

## Plugin Ideas

Community can build exporters for:
- **Confluence** - Atlassian Confluence pages
- **GitLab** - GitLab wikis or repositories
- **S3** - AWS S3 bucket uploads
- **Slack** - Post summaries to channels
- **Email** - Send via SMTP/SendGrid
- **SharePoint** - Microsoft SharePoint pages
- **Custom APIs** - Internal documentation systems

## Installation

### Update Existing Install

**Windows:**
```powershell
irm https://raw.githubusercontent.com/TwitteryBeast12/Notas/main/install.ps1 | iex
```

**Linux:**
```bash
curl -fsSL https://raw.githubusercontent.com/TwitteryBeast12/Notas/main/install.sh | bash
```

### Manual Download
- **notas-win.exe** (47MB)
- **notas-linux** (55MB)

https://github.com/TwitteryBeast12/Notas/releases/tag/v0.6.0

## Breaking Changes

**None.** All existing configs and workflows continue to work. Plugin support is additive.

## For Plugin Developers

See `PLUGIN_TEMPLATE.md` for:
- Plugin structure
- API reference
- Example implementation
- Publishing to npm

**Plugin naming convention:** `@notas/plugin-<platform>`

## What's Next (v0.6.x)

- [ ] Web UI for browser-based editing
- [ ] Custom templates (define your own runbook formats)
- [ ] TUI search/filter for drafts
- [ ] Sample plugins (Confluence, GitLab, S3)

## Full Changelog

https://github.com/TwitteryBeast12/Notas/compare/v0.5.1...v0.6.0
