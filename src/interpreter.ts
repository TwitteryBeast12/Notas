import { createWriteStream, mkdirSync, readFileSync, writeFileSync, existsSync, readdirSync } from 'fs';
import { join } from 'path';
import { homedir } from 'os';
import axios from 'axios';

// Noise filters: remove redundant commands
const NOISE_COMMANDS = new Set(['ls', 'pwd', 'dir', 'clear', 'cls', 'cd', 'echo']);

interface CommandLog {
  command: string;
  output: string;
  timestamp: string;
}

interface Config {
  provider: 'ollama' | 'openai' | 'anthropic';
  ollama: { url: string; model: string };
  openai: { api_key: string; model: string };
  notion: { page_id: string; token: string };
  github: { repo: string; token: string };
  autoExport?: { enabled: boolean; target: 'github' | 'notion' | 'local' };
}

class LLMProvider {
  constructor(protected config: Config) {}
  async complete(prompt: string): Promise<string> {
    throw new Error('Method not implemented');
  }
}

class OllamaProvider extends LLMProvider {
  async complete(prompt: string): Promise<string> {
    try {
      const response = await axios.post(
        `${this.config.ollama.url}/api/generate`,
        { model: this.config.ollama.model, prompt, stream: false },
        { timeout: 60000 }
      );
      return response.data.response || 'AI failed to generate content.';
    } catch (e: any) {
      if (e.code === 'ECONNREFUSED') {
        return 'Ollama Error: Connection refused. Is Ollama running? Try: ollama serve';
      }
      if (e.code === 'ETIMEDOUT') {
        return 'Ollama Error: Request timed out. Is the model loaded?';
      }
      return `Ollama Error: ${e.message}`;
    }
  }
}

class OpenAIProvider extends LLMProvider {
  async complete(prompt: string): Promise<string> {
    try {
      const response = await axios.post(
        'https://api.openai.com/v1/chat/completions',
        {
          model: this.config.openai.model,
          messages: [{ role: 'user', content: prompt }]
        },
        {
          headers: {
            'Authorization': `Bearer ${this.config.openai.api_key}`,
            'Content-Type': 'application/json'
          },
          timeout: 60000
        }
      );
      return response.data.choices[0].message.content;
    } catch (e: any) {
      return `OpenAI Error: ${e.message}`;
    }
  }
}

class ConfigManager {
  private path: string;

  constructor(configPath?: string) {
    this.path = configPath || join(homedir(), '.notas', 'config.json');
  }

  load(): Config {
    if (!existsSync(this.path)) return this.getDefaults();
    try {
      return JSON.parse(readFileSync(this.path, 'utf-8'));
    } catch {
      return this.getDefaults();
    }
  }

  getDefaults(): Config {
    return {
      provider: 'ollama',
      ollama: { url: 'http://localhost:11434', model: 'llama3' },
      openai: { api_key: '', model: 'gpt-4' },
      notion: { page_id: '', token: '' },
      github: { repo: '', token: '' },
      autoExport: { enabled: false, target: 'local' },
    };
  }

  save(config: Config): void {
    mkdirSync(join(homedir(), '.notas'), { recursive: true });
    writeFileSync(this.path, JSON.stringify(config, null, 2));
  }
}

export class NotasInterpreter {
  private sessionId: string;
  private baseDir: string;
  private jsonPath: string;
  private txtPath: string;
  private draftsDir: string;
  private configManager: ConfigManager;

  constructor(sessionId: string, baseDir?: string) {
    this.sessionId = sessionId;
    this.baseDir = baseDir || join(homedir(), '.notas', 'sessions');
    this.jsonPath = join(this.baseDir, `session_${sessionId}.json`);
    this.txtPath = join(this.baseDir, `session_${sessionId}.txt`);
    this.draftsDir = join(homedir(), '.notas', 'drafts');
    this.configManager = new ConfigManager();
  }

  getConfig(): Config {
    return this.configManager.load();
  }

  loadSession(): CommandLog[] {
    if (!existsSync(this.jsonPath)) return [];
    const content = readFileSync(this.jsonPath, 'utf-8');
    return content.split('\n').filter(line => line.trim()).map(line => {
      try { return JSON.parse(line); } catch { return null; }
    }).filter(Boolean);
  }

  loadOutput(): string {
    if (!existsSync(this.txtPath)) return '';
    return readFileSync(this.txtPath, 'utf-8');
  }

  getRelevantContext(): string {
    if (!existsSync(this.draftsDir)) return '';
    const cmds = this.loadSession().map(c => c.command.toLowerCase()).join(' ');
    const words = new Set(cmds.split(/\s+/).filter(w => w.length > 4));
    
    const relevantDocs: string[] = [];
    readdirSync(this.draftsDir).forEach(f => {
      if (f.endsWith('.md')) {
        const content = readFileSync(join(this.draftsDir, f), 'utf-8');
        if (Array.from(words).some(w => content.toLowerCase().includes(w))) {
          relevantDocs.push(`\n--- Past Document (${f}) ---\n${content}`);
        }
      }
    });
    return relevantDocs.slice(0, 2).join('\n');
  }

  cleanNoise(commands: CommandLog[]): CommandLog[] {
    const cleaned: CommandLog[] = [];
    let lastCmd = '';
    for (const cmd of commands) {
      const c = cmd.command.trim().split(' ')[0].toLowerCase();
      if (NOISE_COMMANDS.has(c) && c === lastCmd) continue;
      cleaned.push(cmd);
      lastCmd = c;
    }
    return cleaned;
  }

  scrubPII(text: string): string {
    // Redact common secrets
    let scrubbed = text
      .replace(/(password|passwd|pwd)\s*[=:]\s*\S+/gi, '$1=[REDACTED]')
      .replace(/(secret|api_key|apikey|token|auth)\s*[=:]\s*\S+/gi, '$1=[REDACTED]')
      .replace(/(aws_access_key_id|aws_secret_access_key)\s*[=:]\s*\S+/gi, '$1=[REDACTED]')
      .replace(/Bearer\s+\S+/gi, 'Bearer [REDACTED]')
      .replace(/-----BEGIN (RSA |DSA |EC )?PRIVATE KEY-----[\s\S]*?-----END (RSA |DSA |EC )?PRIVATE KEY-----/gi, '[PRIVATE KEY REDACTED]')
      .replace(/ssh-rsa\s+[A-Za-z0-9+/=]+/gi, 'ssh-rsa [REDACTED]')
      .replace(/(?:mongodb|postgres|mysql|redis):\/\/[^\s"]+/gi, '[CONNECTION STRING REDACTED]')
      .replace(/\b[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}\b/g, '[EMAIL REDACTED]')
      .replace(/\b(?:\d{1,3}\.){3}\d{1,3}\b/g, '[IP REDACTED]');
    
    return scrubbed;
  }

  preparePrompt(templateType = 'runbook'): string {
    const cmds = this.cleanNoise(this.loadSession());
    const output = this.loadOutput();
    const context = this.getRelevantContext();
    
    const templatePath = join(homedir(), '.notas', 'templates', `${templateType}.md`);
    const templateContent = existsSync(templatePath) ? readFileSync(templatePath, 'utf-8') : '';
    
    const cmdSequence = cmds.map(c => `[${c.timestamp}] ${c.command}`).join('\n');
    
    return `
# ROLE: Expert Technical Writer & SRE
# TASK: Transform raw terminal logs into a professional document.

## CONTEXT (Knowledge Graph)
Use these past documents for style and technical consistency:
${context}

## TEMPLATE TO FOLLOW
${templateContent}

## INPUT DATA
### Command Sequence:
${cmdSequence}

### Raw Output Log:
${output}

## REQUIREMENTS
1. Identify the overarching goal.
2. Group related commands into logical "Steps".
3. Maintain consistency with provided Past Context.
4. Format exactly as per the template.
`;
  }

  async generateDraft(templateType = 'runbook'): Promise<string> {
    const config = new ConfigManager().load();
    const provider = config.provider === 'ollama' 
      ? new OllamaProvider(config) 
      : new OpenAIProvider(config);
      
    const prompt = this.preparePrompt(templateType);
    const draftContent = await provider.complete(prompt);
    
    // Scrub PII before saving
    const scrubbedContent = this.scrubPII(draftContent);
    
    mkdirSync(this.draftsDir, { recursive: true });
    const draftPath = join(this.draftsDir, `session_${this.sessionId}_${templateType}.md`);
    writeFileSync(draftPath, scrubbedContent, 'utf-8');
    
    return scrubbedContent;
  }
}
