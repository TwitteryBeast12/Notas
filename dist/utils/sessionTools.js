import { readFileSync, writeFileSync, mkdirSync } from 'fs';
import { join } from 'path';
import { homedir } from 'os';
export function loadSession(sessionId) {
    const jsonPath = join(homedir(), '.notas', 'sessions', `session_${sessionId}.json`);
    const content = readFileSync(jsonPath, 'utf-8');
    const commands = content.split('\n').filter(line => line.trim()).map(line => JSON.parse(line));
    return { commands };
}
export function diffSessions(session1, session2) {
    const s1 = loadSession(session1);
    const s2 = loadSession(session2);
    const lines = [];
    lines.push(`# Session Diff: ${session1} vs ${session2}\n`);
    // Compare commands
    const cmds1 = new Set(s1.commands.map(c => c.command));
    const cmds2 = new Set(s2.commands.map(c => c.command));
    lines.push('## Commands Only in Session 1:');
    s1.commands.forEach(c => {
        if (!cmds2.has(c.command)) {
            lines.push(`- ${c.command}`);
        }
    });
    lines.push('\n## Commands Only in Session 2:');
    s2.commands.forEach(c => {
        if (!cmds1.has(c.command)) {
            lines.push(`+ ${c.command}`);
        }
    });
    lines.push('\n## Common Commands:');
    s1.commands.forEach(c => {
        if (cmds2.has(c.command)) {
            lines.push(`  ${c.command}`);
        }
    });
    return lines.join('\n');
}
export function mergeSessions(sessionIds, outputName) {
    const allCommands = [];
    sessionIds.forEach(id => {
        const session = loadSession(id);
        session.commands.forEach(c => {
            allCommands.push({ ...c, session: id });
        });
    });
    // Sort by timestamp
    allCommands.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
    // Generate merged draft
    const lines = [];
    lines.push(`# Merged Session: ${outputName}\n`);
    lines.push(`*Generated from: ${sessionIds.join(', ')}*\n`);
    let currentSession = '';
    allCommands.forEach(c => {
        if (c.session !== currentSession) {
            lines.push(`\n## From Session: ${c.session}\n`);
            currentSession = c.session;
        }
        lines.push(`\`\`\`bash\n${c.command}\n\`\`\`\n`);
        if (c.output.trim()) {
            lines.push(`\`\`\`\n${c.output}\n\`\`\`\n`);
        }
    });
    const outputPath = join(homedir(), '.notas', 'drafts', `merged_${outputName}.md`);
    mkdirSync(join(outputPath, '..'), { recursive: true });
    writeFileSync(outputPath, lines.join('\n'), 'utf-8');
    return outputPath;
}
