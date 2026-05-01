import { existsSync, readdirSync, readFileSync, mkdirSync } from 'fs';
import { join } from 'path';
import { homedir } from 'os';
export class PluginManager {
    constructor() {
        this.loadedPlugins = new Map();
        this.pluginsDir = join(homedir(), '.notas', 'plugins');
        mkdirSync(this.pluginsDir, { recursive: true });
    }
    async loadPlugins() {
        if (!existsSync(this.pluginsDir)) {
            return;
        }
        const dirs = readdirSync(this.pluginsDir);
        for (const dir of dirs) {
            const pluginPath = join(this.pluginsDir, dir);
            if (!existsSync(pluginPath))
                continue;
            const manifestPath = join(pluginPath, 'package.json');
            if (!existsSync(manifestPath))
                continue;
            try {
                const manifest = JSON.parse(readFileSync(manifestPath, 'utf-8'));
                const mainPath = join(pluginPath, manifest.main || 'index.js');
                if (!existsSync(mainPath)) {
                    console.warn(`⚠️  Plugin ${manifest.name}: main file not found`);
                    continue;
                }
                // Dynamic import of plugin
                const pluginModule = await import(mainPath);
                const plugin = pluginModule.default || pluginModule;
                if (this.validatePlugin(plugin)) {
                    this.loadedPlugins.set(plugin.name, plugin);
                    console.log(`✅ Loaded plugin: ${plugin.name} v${plugin.version}`);
                }
                else {
                    console.warn(`⚠️  Plugin ${manifest.name}: invalid plugin interface`);
                }
            }
            catch (e) {
                console.warn(`⚠️  Failed to load plugin ${dir}: ${e.message}`);
            }
        }
    }
    validatePlugin(plugin) {
        return (typeof plugin.name === 'string' &&
            typeof plugin.version === 'string' &&
            typeof plugin.export === 'function');
    }
    getPlugin(name) {
        return this.loadedPlugins.get(name);
    }
    listPlugins() {
        return Array.from(this.loadedPlugins.keys());
    }
    async export(pluginName, target, content, config) {
        const plugin = this.getPlugin(pluginName);
        if (!plugin) {
            return {
                success: false,
                message: `Plugin '${pluginName}' not found. Install with: npm install -g @notas/plugin-${pluginName}`
            };
        }
        try {
            return await plugin.export(target, content, config);
        }
        catch (e) {
            return {
                success: false,
                message: `Plugin ${pluginName} export failed: ${e.message}`
            };
        }
    }
}
export function getPluginsDir() {
    return join(homedir(), '.notas', 'plugins');
}
