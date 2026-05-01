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
export declare class PluginManager {
    private pluginsDir;
    private loadedPlugins;
    constructor();
    loadPlugins(): Promise<void>;
    private validatePlugin;
    getPlugin(name: string): NotasPlugin | undefined;
    listPlugins(): string[];
    export(pluginName: string, target: string, content: string, config: PluginConfig): Promise<ExportResult>;
}
export declare function getPluginsDir(): string;
