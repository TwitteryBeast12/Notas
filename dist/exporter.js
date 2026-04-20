import { writeFileSync, mkdirSync } from 'fs';
import { join } from 'path';
import axios from 'axios';
export class NotasExporter {
    async exportToGithub(repo, path, content, token) {
        const url = `https://api.github.com/repos/${repo}/contents/${path}`;
        const headers = {
            'Authorization': `token ${token}`,
            'Accept': 'application/vnd.github.v3+json'
        };
        // Check if file exists to get SHA for update
        let sha;
        try {
            const res = await axios.get(url, { headers });
            if (res.status === 200)
                sha = res.data.sha;
        }
        catch (e) {
            // File doesn't exist, that's fine
        }
        const data = {
            message: 'Upload runbook via Notas',
            content: Buffer.from(content, 'utf-8').toString('base64'),
            sha
        };
        const response = await axios.put(url, data, { headers });
        return response.data;
    }
    async exportToNotion(pageId, title, content, token) {
        const url = 'https://api.notion.com/v1/pages';
        const headers = {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
            'Notion-Version': '2022-06-28'
        };
        const data = {
            parent: { page_id: pageId },
            properties: {
                title: { title: [{ text: { content: title } }] }
            },
            children: [
                {
                    object: 'block',
                    type: 'paragraph',
                    paragraph: { rich_text: [{ type: 'text', text: { content: content.slice(0, 2000) } }] }
                }
            ]
        };
        const response = await axios.post(url, data, { headers });
        return response.data;
    }
    exportLocal(filepath, content) {
        mkdirSync(join(filepath, '..'), { recursive: true });
        writeFileSync(filepath, content, 'utf-8');
        return { status: 'success', path: filepath };
    }
}
