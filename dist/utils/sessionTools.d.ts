interface SessionData {
    commands: Array<{
        command: string;
        output: string;
        timestamp: string;
    }>;
}
export declare function loadSession(sessionId: string): SessionData;
export declare function diffSessions(session1: string, session2: string): string;
export declare function mergeSessions(sessionIds: string[], outputName: string): string;
export {};
