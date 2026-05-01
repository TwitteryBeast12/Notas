import { existsSync, readdirSync, readFileSync, mkdirSync } from 'fs';
import { join } from 'path';
import { homedir } from 'os';

export interface ExportResult {
  success: boolean;
  url?: string;
  path?: string;
  message?: string;
}

export interface PluginConfig {
  enabled: boolean;
  [key: string]: any;
}

export interface NotasPlugin {
  name: string;
  version: string;
  description?: string;
  export(target: string, content: string, config: PluginConfig): Promise<ExportResult>;
}

export interface PluginManifest {
  name: string;
  version: string;
  description?: string;
  main: string;
}

export class PluginManager {
  private pluginsDir: string;
  private loadedPlugins: Map<string, NotasPlugin> = new Map();

  constructor() {
    this.pluginsDir = join(homedir(), '.notas', 'plugins');
    mkdirSync(this.pluginsDir, { recursive: true });
  }

  async loadPlugins(): Promise<void> {
    if (!existsSync(this.pluginsDir)) {
      return;
    }

    const dirs = readdirSync(this.pluginsDir);
    for (const dir of dirs) {
      const pluginPath = join(this.pluginsDir, dir);
      if (!existsSync(pluginPath)) continue;

      const manifestPath = join(pluginPath, 'package.json');
      if (!existsSync(manifestPath)) continue;

      try {
        const manifest: PluginManifest = JSON.parse(readFileSync(manifestPath, 'utf-8'));
        const mainPath = join(pluginPath, manifest.main || 'index.js');

        if (!existsSync(mainPath)) {
          console.warn(`⚠️  Plugin ${manifest.name}: main file not found`);
          continue;
        }

        // Dynamic import of plugin
        const pluginModule = await import(mainPath);
        const plugin: NotasPlugin = pluginModule.default || pluginModule;

        if (this.validatePlugin(plugin)) {
          this.loadedPlugins.set(plugin.name, plugin);
          console.log(`✅ Loaded plugin: ${plugin.name} v${plugin.version}`);
        } else {
          console.warn(`⚠️  Plugin ${manifest.name}: invalid plugin interface`);
        }
      } catch (e: any) {
        console.warn(`⚠️  Failed to load plugin ${dir}: ${e.message}`);
      }
    }
  }

  private validatePlugin(plugin: any): plugin is NotasPlugin {
    return (
      typeof plugin.name === 'string' &&
      typeof plugin.version === 'string' &&
      typeof plugin.export === 'function'
    );
  }

  getPlugin(name: string): NotasPlugin | undefined {
    return this.loadedPlugins.get(name);
  }

  listPlugins(): string[] {
    return Array.from(this.loadedPlugins.keys());
  }

  async export(pluginName: string, target: string, content: string, config: PluginConfig): Promise<ExportResult> {
    const plugin = this.getPlugin(pluginName);
    if (!plugin) {
      return {
        success: false,
        message: `Plugin '${pluginName}' not found. Install with: npm install -g @notas/plugin-${pluginName}`
      };
    }

    try {
      return await plugin.export(target, content, config);
    } catch (e: any) {
      return {
        success: false,
        message: `Plugin ${pluginName} export failed: ${e.message}`
      };
    }
  }
}

export function getPluginsDir(): string {
  return join(homedir(), '.notas', 'plugins');
}
