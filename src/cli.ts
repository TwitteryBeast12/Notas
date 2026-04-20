#!/usr/bin/env node
import { NotasInterpreter } from './interpreter.js';
import { NotasExporter } from './exporter.js';
import { program } from 'commander';
import { join } from 'path';
import { homedir } from 'os';
import { existsSync, mkdirSync, writeFileSync } from 'fs';

program
  .name('notas')
  .description('Terminal activity to structured documentation')
  .version('0.1.0');

program
  .command('rec <sessionId>')
  .description('Start recording a terminal session')
  .action((sessionId: string) => {
    const baseDir = join(homedir(), '.notas', 'sessions');
    mkdirSync(baseDir, { recursive: true });
    const jsonPath = join(baseDir, `session_${sessionId}.json`);
    const txtPath = join(baseDir, `session_${sessionId}.txt`);
    
    // Initialize empty files
    writeFileSync(jsonPath, '', 'utf-8');
    writeFileSync(txtPath, '', 'utf-8');
    
    console.log(`📝 Recording started: session_${sessionId}`);
    console.log(`   Commands will be logged to: ${jsonPath}`);
    console.log(`   Output will be logged to: ${txtPath}`);
    console.log(`   Run 'notas stop ${sessionId}' when finished.`);
  });

program
  .command('stop <sessionId>')
  .description('Stop recording and generate draft')
  .action(async (sessionId: string) => {
    console.log(`⏹️  Recording stopped: session_${sessionId}`);
    console.log(`🤖 Generating draft...`);
    
    try {
      const interpreter = new NotasInterpreter(sessionId);
      const draft = await interpreter.generateDraft('runbook');
      
      const draftPath = join(homedir(), '.notas', 'drafts', `session_${sessionId}_runbook.md`);
      console.log(`✅ Draft generated: ${draftPath}`);
      console.log(`   Review with: notas review ${sessionId}`);
    } catch (e: any) {
      console.error(`❌ Error generating draft: ${e.message}`);
    }
  });

program
  .command('review <sessionId>')
  .description('Review and export a draft')
  .action((sessionId: string) => {
    const draftPath = join(homedir(), '.notas', 'drafts', `session_${sessionId}_runbook.md`);
    if (!existsSync(draftPath)) {
      console.error(`❌ Draft not found: ${draftPath}`);
      return;
    }
    console.log(`📄 Draft found: ${draftPath}`);
    console.log(`   Open this file to review, then run 'notas export ${sessionId}'`);
  });

program
  .command('export <sessionId>')
  .description('Export final draft to GitHub/Notion/Local')
  .action((sessionId: string) => {
    console.log(`🚀 Export logic placeholder for session_${sessionId}`);
    console.log(`   (Integration with GitHub/Notion APIs goes here)`);
  });

program.parse();
