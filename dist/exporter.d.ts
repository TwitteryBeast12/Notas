export declare class NotasExporter {
    exportToGithub(repo: string, path: string, content: string, token: string): Promise<any>;
    exportToNotion(pageId: string, title: string, content: string, token: string): Promise<any>;
    exportLocal(filepath: string, content: string): {
        status: string;
        path: string;
    };
}
