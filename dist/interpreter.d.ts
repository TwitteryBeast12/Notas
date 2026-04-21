interface CommandLog {
    command: string;
    output: string;
    timestamp: string;
}
interface Config {
    provider: 'ollama' | 'openai' | 'anthropic';
    ollama: {
        url: string;
        model: string;
    };
    openai: {
        api_key: string;
        model: string;
    };
    notion: {
        page_id: string;
        token: string;
    };
    github: {
        repo: string;
        token: string;
    };
    autoExport?: {
        enabled: boolean;
        target: 'github' | 'notion' | 'local';
    };
}
export declare class NotasInterpreter {
    private sessionId;
    private baseDir;
    private jsonPath;
    private txtPath;
    private draftsDir;
    private configManager;
    constructor(sessionId: string, baseDir?: string);
    getConfig(): Config;
    loadSession(): CommandLog[];
    loadOutput(): string;
    getRelevantContext(): string;
    cleanNoise(commands: CommandLog[]): CommandLog[];
    scrubPII(text: string): string;
    preparePrompt(templateType?: string): string;
    generateDraft(templateType?: string): Promise<string>;
}
export {};
