import { writeFileSync, mkdirSync, existsSync, readFileSync } from 'fs';
import { join } from 'path';
import { homedir } from 'os';
import axios from 'axios';

interface Config {
  github: { repo: string; token: string };
  notion: { page_id: string; token: string };
}

export class NotasExporter {
  private config: Config;

  constructor(config: Config) {
    this.config = config;
  }

  async exportToGithub(path: string, content: string): Promise<any> {
    const { repo, token } = this.config.github;
    const url = `https://api.github.com/repos/${repo}/contents/${path}`;
    const headers = {
      'Authorization': `token ${token}`,
      'Accept': 'application/vnd.github.v3+json'
    };

    let sha: string | undefined;
    try {
      const res = await axios.get(url, { headers });
      if (res.status === 200) sha = res.data.sha;
    } catch (e) {
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

  async exportToNotion(title: string, content: string): Promise<any> {
    const { page_id: pageId, token } = this.config.notion;
    const url = 'https://api.notion.com/v1/pages';
    const headers = {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
      'Notion-Version': '2022-06-28'
    };

    // Parse markdown into Notion blocks (simplified for v0.2)
    const blocks = content.split('\n\n').map(para => ({
      object: 'block',
      type: 'paragraph',
      paragraph: {
        rich_text: [{ type: 'text', text: { content: para.slice(0, 2000) } }]
      }
    })).slice(0, 100); // Notion API limit

    const data = {
      parent: { page_id: pageId },
      properties: {
        title: { title: [{ text: { content: title } }] }
      },
      children: blocks
    };

    const response = await axios.post(url, data, { headers });
    return { success: true, url: response.data.url };
  }

  exportLocal(filename: string, content: string): { success: boolean; path: string } {
    const outputPath = join(homedir(), '.notas', 'final', filename);
    mkdirSync(join(outputPath, '..'), { recursive: true });
    writeFileSync(outputPath, content, 'utf-8');
    return { success: true, path: outputPath };
  }
}

export function loadConfig(): Config {
  const configPath = join(homedir(), '.notas', 'config.json');
  if (!existsSync(configPath)) {
    throw new Error('Config not found. Run "notas config" to set up.');
  }
  return JSON.parse(readFileSync(configPath, 'utf-8'));
}
