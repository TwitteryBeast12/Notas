#!/usr/bin/env node
import { program } from 'commander';
import { join } from 'path';
import { homedir } from 'os';
import { existsSync, mkdirSync, writeFileSync, readFileSync, readdirSync } from 'fs';
import { execSync } from 'child_process';
import { NotasInterpreter } from './interpreter.js';
import { NotasExporter, loadConfig } from './exporter.js';
import { PluginManager, PluginConfig } from './plugin.js';
import { GitConfig, commitDraft, getVaultDir, initVault, pushVault, vaultStatus } from './gitStore.js';

program
  .name('notas')
  .description('Terminal activity to structured documentation')
  .version('0.6.1');

program
  .command('rec <sessionId>')
  .description('Start recording a terminal session')
  .action((sessionId: string) => {
    const baseDir = join(homedir(), '.notas', 'sessions');
    mkdirSync(baseDir, { recursive: true });
    const jsonPath = join(baseDir, `session_${sessionId}.json`);
    const txtPath = join(baseDir, `session_${sessionId}.txt`);
    
    writeFileSync(jsonPath, '', 'utf-8');
    writeFileSync(txtPath, '', 'utf-8');
    
    try {
      const cmd = process.platform === 'win32' 
        ? `powershell.exe -File capture.ps1 -Start` 
        : `source ~/.notas/capture_bash.sh`;
      
      execSync(cmd, { shell: process.platform === 'win32' ? undefined : '/bin/bash', stdio: 'inherit' });
    } catch (e) {
      console.warn(`⚠️  Warning: Could not trigger capture script. Please ensure it is installed.`);
    }

    console.log(`📝 Recording started: session_${sessionId}`);
    console.log(`   Commands: ${jsonPath}`);
    console.log(`   Output: ${txtPath}`);
    console.log(`   Run 'notas stop ${sessionId}' when finished.`);
  });

program
  .command('stop <sessionId>')
  .description('Stop recording and generate draft')
  .action(async (sessionId: string) => {
    console.log(`⏹️  Recording stopped: session_${sessionId}`);
    
    try {
      const cmd = process.platform === 'win32' 
        ? `powershell.exe -File capture.ps1 -Stop` 
        : `source ~/.notas/capture_bash.sh && stop_notas_capture`;
      
      execSync(cmd, { shell: process.platform === 'win32' ? undefined : '/bin/bash', stdio: 'inherit' });
    } catch (e) {
      console.warn(`⚠️  Warning: Could not trigger stop script.`);
    }

    console.log(`🤖 Generating draft...`);
    
    try {
      const interpreter = new NotasInterpreter(sessionId);
      const draft = await interpreter.generateDraft('runbook');
      const config = interpreter.getConfig();
      
      const draftPath = join(homedir(), '.notas', 'drafts', `session_${sessionId}_runbook.md`);
      console.log(`✅ Draft generated: ${draftPath}`);

      // Auto-commit to the local vault (privacy-safe: local-only unless a remote is set).
      const gitCfg = config.git as GitConfig | undefined;
      if (gitCfg?.enabled) {
        try {
          const { committed, sha } = commitDraft(sessionId, draft, getVaultDir());
          if (committed) {
            console.log(`🔒 Committed to local vault: ${sha ?? ''}`.trim());
          } else {
            console.log(`🔒 Vault unchanged (already committed)`);
          }
        } catch (gitErr: any) {
          console.warn(`⚠️  Vault commit skipped: ${gitErr.message}`);
        }
      }
      
      // Auto-export if enabled
      if (config.autoExport?.enabled) {
        const target = config.autoExport.target;
        console.log(`🚀 Auto-exporting to ${target}...`);
        const { NotasExporter } = await import('./exporter.js');
        const exporter = new NotasExporter(config);
        
        if (target === 'local') {
          const result = exporter.exportLocal(`session_${sessionId}_final.md`, draft);
          console.log(`✅ Exported locally: ${result.path}`);
        } else if (target === 'github') {
          const result = await exporter.exportToGithub(`runbooks/session_${sessionId}.md`, draft);
          console.log(`✅ Exported to GitHub: ${result.url}`);
        } else if (target === 'notion') {
          const result = await exporter.exportToNotion(`Session ${sessionId}`, draft);
          console.log(`✅ Exported to Notion: ${result.url}`);
        }
      } else {
        console.log(`   Review with: notas list`);
      }
    } catch (e: any) {
      console.error(`❌ Error: ${e.message}`);
    }
  });

program
  .command('diff <session1> <session2>')
  .description('Compare two sessions')
  .action(async (session1: string, session2: string) => {
    try {
      const { diffSessions } = await import('./utils/sessionTools.js');
      const diff = diffSessions(session1, session2);
      console.log(diff);
    } catch (e: any) {
      console.error(`❌ Error: ${e.message}`);
    }
  });

program
  .command('merge <sessions...>')
  .description('Merge multiple sessions into one draft')
  .option('-o, --output <name>', 'Output filename')
  .action(async (sessions: string[], options: { output?: string }) => {
    try {
      const { mergeSessions } = await import('./utils/sessionTools.js');
      const outputName = options.output || `merged_${Date.now()}`;
      const outputPath = mergeSessions(sessions, outputName);
      console.log(`✅ Merged ${sessions.length} sessions into: ${outputPath}`);
    } catch (e: any) {
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
  .command('review')
  .description('Review drafts in TUI')
  .action(async () => {
    const { spawn } = await import('child_process');
    const path = await import('path');
    const runner = path.default.join(path.default.dirname(__filename), 'tui-runner.js');
    spawn('node', [runner], { stdio: 'inherit' });
  });

program
  .command('view <sessionId>')
  .description('View draft content')
  .action((sessionId: string) => {
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
  .command('git <action>')
  .description('Manage the local drafts vault (git)')
  .argument('<action>', 'init | status | push [remote]')
  .action((action: string, options: { push?: string }, command: any) => {
    try {
      const vaultDir = getVaultDir();
      if (action === 'init') {
        const { created } = initVault(vaultDir);
        console.log(created ? '✅ Local vault initialized.' : '🔒 Vault already exists.');
        console.log(`   Location: ${vaultDir}`);
        console.log('   Commits stay LOCAL unless you set a remote.');
      } else if (action === 'status') {
        console.log(`🔒 Vault: ${vaultStatus(vaultDir)}`);
      } else if (action === 'push') {
        // commander stores extra tokens in command.args
        const remote = (command?.args && command.args[1]) || options?.push;
        const res = pushVault(remote, vaultDir);
        console.log(res.pushed ? `✅ ${res.message}` : `⚠️  ${res.message}`);
      } else {
        console.log('Usage: notas git <init|status|push [remote]>');
      }
    } catch (e: any) {
      console.error(`❌ Vault error: ${e.message}`);
    }
  });

program
  .command('export <sessionId> [target]')
  .description('Export draft to github/notion/local or plugin')
  .action(async (sessionId: string, target?: string) => {
    const draftPath = join(homedir(), '.notas', 'drafts', `session_${sessionId}_runbook.md`);
    if (!existsSync(draftPath)) {
      console.error(`❌ Draft not found: ${draftPath}`);
      return;
    }
    
    const content = readFileSync(draftPath, 'utf-8');
    const targetPlatform = target || 'local';
    
    try {
      const config = loadConfig();
      
      // Check if target is a plugin
      if (config.plugins && config.plugins[targetPlatform]) {
        const pluginConfig = config.plugins[targetPlatform] as PluginConfig;
        if (!pluginConfig.enabled) {
          console.error(`❌ Plugin '${targetPlatform}' is disabled in config`);
          return;
        }
        
        const pluginManager = new PluginManager();
        await pluginManager.loadPlugins();
        
        const result = await pluginManager.export(targetPlatform, targetPlatform, content, pluginConfig);
        if (result.success) {
          console.log(`✅ Exported via ${targetPlatform}: ${result.url || result.path || result.message}`);
        } else {
          console.error(`❌ Export failed: ${result.message}`);
        }
        return;
      }
      
      // Built-in exporters
      const exporter = new NotasExporter(config);
      
      if (targetPlatform === 'local') {
        const result = exporter.exportLocal(`session_${sessionId}_final.md`, content);
        console.log(`✅ Exported locally: ${result.path}`);
      } else if (targetPlatform === 'github') {
        const result = await exporter.exportToGithub(`runbooks/session_${sessionId}.md`, content);
        console.log(`✅ Exported to GitHub: ${result.url}`);
      } else if (targetPlatform === 'notion') {
        const result = await exporter.exportToNotion(`Session ${sessionId}`, content);
        console.log(`✅ Exported to Notion: ${result.url}`);
      } else {
        console.error(`❌ Unknown target: ${targetPlatform}. Use: github, notion, local or a plugin name`);
        const pluginManager = new PluginManager();
        await pluginManager.loadPlugins();
        const plugins = pluginManager.listPlugins();
        console.log(`   Installed plugins: ${plugins.length > 0 ? plugins.join(', ') : 'none'}`);
      }
    } catch (e: any) {
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
        plugins: {},
        git: { enabled: false },
      };
      writeFileSync(configPath, JSON.stringify(defaultConfig, null, 2));
      console.log(`✅ Config created: ${configPath}`);
      console.log(`   Edit this file to set your API keys.`);
    } else {
      console.log(`📄 Config exists: ${configPath}`);
      console.log(readFileSync(configPath, 'utf-8'));
    }
  });

program
  .command('plugins')
  .description('List installed plugins')
  .action(async () => {
    const pluginManager = new PluginManager();
    await pluginManager.loadPlugins();
    const plugins = pluginManager.listPlugins();
    
    if (plugins.length === 0) {
      console.log('No plugins installed.');
      console.log('');
      console.log('Install plugins with:');
      console.log('  npm install -g @notas/plugin-<name>');
      console.log('');
      console.log('Available plugins: https://www.npmjs.com/search?q=@notas%2Fplugin');
    } else {
      console.log('');
      console.log('🔌 Installed Plugins:');
      console.log('');
      plugins.forEach(p => console.log(`  - ${p}`));
      console.log('');
      console.log('Use with: notas export <session> <plugin-name>');
      console.log('');
    }
  });

program.parse();
