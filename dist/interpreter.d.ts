interface CommandLog {
    command: string;
    output: string;
    timestamp: string;
}
export declare class NotasInterpreter {
    private sessionId;
    private baseDir;
    private jsonPath;
    private txtPath;
    private draftsDir;
    constructor(sessionId: string, baseDir?: string);
    loadSession(): CommandLog[];
    loadOutput(): string;
    getRelevantContext(): string;
    cleanNoise(commands: CommandLog[]): CommandLog[];
    preparePrompt(templateType?: string): string;
    generateDraft(templateType?: string): Promise<string>;
}
export {};
