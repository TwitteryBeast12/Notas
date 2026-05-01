# Notas Plugin Template

Create custom exporters for Notas in minutes.

## Quick Start

```bash
# Create plugin directory
mkdir -p ~/my-notas-plugin
cd ~/my-notas-plugin

# Initialize npm project
npm init -y

# Install dependencies
npm install axios
```

## Plugin Structure

```
my-notas-plugin/
├── package.json
├── index.ts (or index.js)
└── README.md
```

## package.json

```json
{
  "name": "@notas/plugin-confluence",
  "version": "1.0.0",
  "description": "Export Notas runbooks to Confluence",
  "main": "index.js",
  "type": "module",
  "scripts": {
    "build": "tsc"
  },
  "dependencies": {
    "axios": "^1.6.0"
  }
}
```

## index.ts

```typescript
import axios from 'axios';

interface ExportResult {
  success: boolean;
  url?: string;
  path?: string;
  message?: string;
}

interface PluginConfig {
  enabled: boolean;
  apiUrl: string;
  spaceKey: string;
  username: string;
  apiToken: string;
}

async function export(target: string, content: string, config: PluginConfig): Promise<ExportResult> {
  try {
    // Convert markdown to Confluence storage format
    const confluenceContent = convertToConfluence(content);
    
    // Create or update page
    const response = await axios.post(
      `${config.apiUrl}/rest/api/content`,
      {
        type: 'page',
        title: `Runbook: ${new Date().toISOString()}`,
        space: { key: config.spaceKey },
        body: {
          storage: {
            value: confluenceContent,
            representation: 'storage'
          }
        }
      },
      {
        auth: {
          username: config.username,
          password: config.apiToken
        }
      }
    );
    
    return {
      success: true,
      url: `${config.apiUrl}${response.data._links.webui}`
    };
  } catch (e: any) {
    return {
      success: false,
      message: `Confluence export failed: ${e.message}`
    };
  }
}

function convertToConfluence(markdown: string): string {
  // Simple markdown to Confluence storage format
  // In production, use a proper markdown parser
  return markdown
    .replace(/^# (.*$)/gim, '<h1>$1</h1>')
    .replace(/^## (.*$)/gim, '<h2>$1</h2>')
    .replace(/^### (.*$)/gim, '<h3>$1</h3>')
    .replace(/```(\w*)([\s\S]*?)```/gim, '<ac:structured-macro ac:name="code"><ac:parameter ac:name="language">$1</ac:parameter><ac:plain-text-body><![CDATA[$2]]></ac:plain-text-body></ac:structured-macro>')
    .replace(/\*\*(.*?)\*\*/gim, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/gim, '<em>$1</em>');
}

export default {
  name: 'confluence',
  version: '1.0.0',
  description: 'Export to Confluence',
  export
};
```

## Install Your Plugin

```bash
# Build if using TypeScript
npm run build

# Link globally
npm link

# Or publish to npm
npm publish --access public
```

## Configure in Notas

Edit `~/.notas/config.json`:

```json
{
  "plugins": {
    "confluence": {
      "enabled": true,
      "apiUrl": "https://your-domain.atlassian.net/wiki",
      "spaceKey": "RUNBOOKS",
      "username": "your-email@company.com",
      "apiToken": "your-api-token"
    }
  }
}
```

## Use the Plugin

```bash
# List installed plugins
notas plugins

# Export using plugin
notas export "my-session" confluence
```

## Plugin API Reference

### Interface

```typescript
interface NotasPlugin {
  name: string;           // Plugin identifier
  version: string;        // Semver version
  description?: string;   // Optional description
  export(
    target: string,       // Target name (same as plugin name)
    content: string,      // Markdown content to export
    config: PluginConfig  // Plugin-specific config from config.json
  ): Promise<ExportResult>;
}

interface ExportResult {
  success: boolean;
  url?: string;           // URL to exported content
  path?: string;          // Local file path (for local exporters)
  message?: string;       // Success/failure message
}
```

### Plugin Discovery

Plugins are loaded from `~/.notas/plugins/`. Each plugin must have:
- `package.json` with `name`, `version`, `main` fields
- Main file that exports default plugin object

### Best Practices

1. **Error handling**: Always catch errors and return `ExportResult` with `success: false`
2. **Validation**: Validate config before attempting export
3. **Logging**: Use console.log for success, console.error for failures
4. **Security**: Never log API tokens or sensitive config values
5. **Testing**: Test with real API endpoints before publishing

## Example Plugins

- **Confluence**: Export to Atlassian Confluence
- **GitLab**: Push to GitLab wiki or repository
- **S3**: Upload to AWS S3 bucket
- **Slack**: Post summary to Slack channel
- **Email**: Send via SMTP or SendGrid

## Publishing

```bash
# Scope with @notas for discoverability
npm publish --access public

# Tag for versions
npm version patch  # 1.0.1
npm version minor  # 1.1.0
npm version major  # 2.0.0
```

Search on npm: https://www.npmjs.com/search?q=@notas%2Fplugin
