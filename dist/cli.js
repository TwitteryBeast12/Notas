#!/usr/bin/env node
import { program } from 'commander';
import { join } from 'path';
import { homedir } from 'os';
import { existsSync, mkdirSync, writeFileSync, readFileSync, readdirSync } from 'fs';
import { NotasInterpreter } from './interpreter.js';
import { NotasExporter, loadConfig } from './exporter.js';
program
    .name('notas')
    .description('Terminal activity to structured documentation')
    .version('0.2.0');
program
    .command('rec <sessionId>')
    .description('Start recording a terminal session')
    .action((sessionId) => {
    const baseDir = join(homedir(), '.notas', 'sessions');
    mkdirSync(baseDir, { recursive: true });
    const jsonPath = join(baseDir, `session_${sessionId}.json`);
    const txtPath = join(baseDir, `session_${sessionId}.txt`);
    writeFileSync(jsonPath, '', 'utf-8');
    writeFileSync(txtPath, '', 'utf-8');
    console.log(`📝 Recording started: session_${sessionId}`);
    console.log(`   Commands: ${jsonPath}`);
    console.log(`   Output: ${txtPath}`);
    console.log(`   Run 'notas stop ${sessionId}' when finished.`);
});
program
    .command('stop <sessionId>')
    .description('Stop recording and generate draft')
    .action(async (sessionId) => {
    console.log(`⏹️  Recording stopped: session_${sessionId}`);
    console.log(`🤖 Generating draft...`);
    try {
        const interpreter = new NotasInterpreter(sessionId);
        const draft = await interpreter.generateDraft('runbook');
        const draftPath = join(homedir(), '.notas', 'drafts', `session_${sessionId}_runbook.md`);
        console.log(`✅ Draft generated: ${draftPath}`);
        console.log(`   Review with: notas list`);
    }
    catch (e) {
        console.error(`❌ Error: ${e.message}`);
    }
});
program
    .command('list')
    .description('List available drafts')
    .action(() => {
    const draftsDir = join(homedir(), '.notas', 'drafts');
    if (!existsSync(draftsDir)) {
        console.log('No drafts found.');
        return;
    }
    const files = readdirSync(draftsDir).filter(f => f.endsWith('.md'));
    if (files.length === 0) {
        console.log('No drafts found.');
        return;
    }
    console.log('\n📝 Available Drafts:\n');
    files.forEach((f, i) => {
        const match = f.match(/session_(.+)_(.+)\.md/);
        const sessionId = match ? match[1] : 'unknown';
        const type = match ? match[2] : 'runbook';
        console.log(`  ${i + 1}. ${f} (Session: ${sessionId}, Type: ${type})`);
    });
    console.log('\nExport with: notas export <sessionId> [github|notion|local]\n');
});
program
    .command('view <sessionId>')
    .description('View draft content')
    .action((sessionId) => {
    const draftPath = join(homedir(), '.notas', 'drafts', `session_${sessionId}_runbook.md`);
    if (!existsSync(draftPath)) {
        console.error(`❌ Draft not found: ${draftPath}`);
        return;
    }
    const content = readFileSync(draftPath, 'utf-8');
    console.log('\n--- Draft Content ---\n');
    console.log(content);
    console.log('\n--- End ---\n');
});
program
    .command('export <sessionId> [target]')
    .description('Export draft to github/notion/local')
    .action(async (sessionId, target) => {
    const draftPath = join(homedir(), '.notas', 'drafts', `session_${sessionId}_runbook.md`);
    if (!existsSync(draftPath)) {
        console.error(`❌ Draft not found: ${draftPath}`);
        return;
    }
    const content = readFileSync(draftPath, 'utf-8');
    const targetPlatform = target || 'local';
    try {
        if (targetPlatform === 'local') {
            const exporter = new NotasExporter({ github: { repo: '', token: '' }, notion: { page_id: '', token: '' } });
            const result = exporter.exportLocal(`session_${sessionId}_final.md`, content);
            console.log(`✅ Exported locally: ${result.path}`);
        }
        else if (targetPlatform === 'github') {
            const config = loadConfig();
            const exporter = new NotasExporter(config);
            const result = await exporter.exportToGithub(`runbooks/session_${sessionId}.md`, content);
            console.log(`✅ Exported to GitHub: ${result.url}`);
        }
        else if (targetPlatform === 'notion') {
            const config = loadConfig();
            const exporter = new NotasExporter(config);
            const result = await exporter.exportToNotion(`Session ${sessionId}`, content);
            console.log(`✅ Exported to Notion: ${result.url}`);
        }
        else {
            console.error(`❌ Unknown target: ${targetPlatform}. Use: github, notion, local`);
        }
    }
    catch (e) {
        console.error(`❌ Export failed: ${e.message}`);
    }
});
program
    .command('config')
    .description('Configure API keys and settings')
    .action(() => {
    const configPath = join(homedir(), '.notas', 'config.json');
    mkdirSync(join(homedir(), '.notas'), { recursive: true });
    if (!existsSync(configPath)) {
        const defaultConfig = {
            provider: 'ollama',
            ollama: { url: 'http://localhost:11434', model: 'llama3' },
            github: { repo: '', token: '' },
            notion: { page_id: '', token: '' },
        };
        writeFileSync(configPath, JSON.stringify(defaultConfig, null, 2));
        console.log(`✅ Config created: ${configPath}`);
        console.log(`   Edit this file to set your API keys.`);
    }
    else {
        console.log(`📄 Config exists: ${configPath}`);
        console.log(readFileSync(configPath, 'utf-8'));
    }
});
program.parse();
