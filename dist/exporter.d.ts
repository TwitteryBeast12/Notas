import { PluginConfig } from './plugin.js';
interface Config {
    github: {
        repo: string;
        token: string;
    };
    notion: {
        page_id: string;
        token: string;
    };
    plugins?: Record<string, PluginConfig>;
}
export declare class NotasExporter {
    private config;
    constructor(config: Config);
    exportToGithub(path: string, content: string): Promise<any>;
    exportToNotion(title: string, content: string): Promise<any>;
    private parseMarkdownToBlocks;
    exportLocal(filename: string, content: string): {
        success: boolean;
        path: string;
    };
}
export declare function loadConfig(): Config;
export {};
