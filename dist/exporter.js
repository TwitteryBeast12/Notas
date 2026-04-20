import { writeFileSync, mkdirSync, existsSync, readFileSync } from 'fs';
import { join } from 'path';
import { homedir } from 'os';
import axios from 'axios';
export class NotasExporter {
    constructor(config) {
        this.config = config;
    }
    async exportToGithub(path, content) {
        const { repo, token } = this.config.github;
        const url = `https://api.github.com/repos/${repo}/contents/${path}`;
        const headers = {
            'Authorization': `token ${token}`,
            'Accept': 'application/vnd.github.v3+json'
        };
        let sha;
        try {
            const res = await axios.get(url, { headers });
            if (res.status === 200)
                sha = res.data.sha;
        }
        catch (e) {
            // File doesn't exist
        }
        const data = {
            message: `Upload runbook via Notas - ${new Date().toISOString().split('T')[0]}`,
            content: Buffer.from(content, 'utf-8').toString('base64'),
            sha
        };
        const response = await axios.put(url, data, { headers });
        return { success: true, url: response.data.content.html_url };
    }
    async exportToNotion(title, content) {
        const { page_id: pageId, token } = this.config.notion;
        const url = 'https://api.notion.com/v1/pages';
        const blocksUrl = 'https://api.notion.com/v1/blocks';
        const headers = {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
            'Notion-Version': '2022-06-28'
        };
        // Parse markdown into Notion blocks
        const blocks = this.parseMarkdownToBlocks(content);
        // Create page
        const pageData = {
            parent: { page_id: pageId },
            properties: {
                title: { title: [{ text: { content: title } }] }
            }
        };
        const pageResponse = await axios.post(url, pageData, { headers });
        const pageIdResult = pageResponse.data.id;
        // Append blocks to page
        await axios.patch(`${blocksUrl}/${pageIdResult}/children`, { children: blocks }, { headers });
        return { success: true, url: pageResponse.data.url };
    }
    parseMarkdownToBlocks(content) {
        const lines = content.split('\n');
        const blocks = [];
        let currentList = [];
        let inCodeBlock = false;
        let codeLines = [];
        let codeLanguage = '';
        for (let i = 0; i < lines.length; i++) {
            const line = lines[i];
            // Code blocks
            if (line.startsWith('```')) {
                if (!inCodeBlock) {
                    inCodeBlock = true;
                    codeLanguage = line.slice(3).trim();
                    codeLines = [];
                }
                else {
                    blocks.push({
                        object: 'block',
                        type: 'code',
                        code: {
                            rich_text: [{ type: 'text', text: { content: codeLines.join('\n').slice(0, 2000) } }],
                            language: codeLanguage || 'plain text'
                        }
                    });
                    inCodeBlock = false;
                }
                continue;
            }
            if (inCodeBlock) {
                codeLines.push(line);
                continue;
            }
            // Headings
            if (line.startsWith('### ')) {
                blocks.push({
                    object: 'block',
                    type: 'heading_3',
                    heading_3: { rich_text: [{ type: 'text', text: { content: line.slice(4) } }] }
                });
                continue;
            }
            if (line.startsWith('## ')) {
                blocks.push({
                    object: 'block',
                    type: 'heading_2',
                    heading_2: { rich_text: [{ type: 'text', text: { content: line.slice(3) } }] }
                });
                continue;
            }
            if (line.startsWith('# ')) {
                blocks.push({
                    object: 'block',
                    type: 'heading_1',
                    heading_1: { rich_text: [{ type: 'text', text: { content: line.slice(2) } }] }
                });
                continue;
            }
            // Lists
            if (line.match(/^[\-\*] /)) {
                currentList.push({
                    type: 'bulleted_list_item',
                    bulleted_list_item: { rich_text: [{ type: 'text', text: { content: line.slice(2) } }] }
                });
                continue;
            }
            if (line.match(/^\d+\. /)) {
                currentList.push({
                    type: 'numbered_list_item',
                    numbered_list_item: { rich_text: [{ type: 'text', text: { content: line.replace(/^\d+\. /, '') } }] }
                });
                continue;
            }
            // Flush list if we hit non-list item
            if (currentList.length > 0) {
                blocks.push(...currentList);
                currentList = [];
            }
            // Empty lines
            if (line.trim() === '')
                continue;
            // Regular paragraphs
            blocks.push({
                object: 'block',
                type: 'paragraph',
                paragraph: { rich_text: [{ type: 'text', text: { content: line.slice(0, 2000) } }] }
            });
        }
        // Flush remaining
        if (currentList.length > 0)
            blocks.push(...currentList);
        return blocks.slice(0, 100); // Notion API limit
    }
    exportLocal(filename, content) {
        const outputPath = join(homedir(), '.notas', 'final', filename);
        mkdirSync(join(outputPath, '..'), { recursive: true });
        writeFileSync(outputPath, content, 'utf-8');
        return { success: true, path: outputPath };
    }
}
export function loadConfig() {
    const configPath = join(homedir(), '.notas', 'config.json');
    if (!existsSync(configPath)) {
        throw new Error('Config not found. Run "notas config" to set up.');
    }
    return JSON.parse(readFileSync(configPath, 'utf-8'));
}
