import React, { useState, useEffect } from 'ink';
import { Box, Text, useInput, useApp } from 'ink';
import { readdirSync, readFileSync } from 'fs';
import { join } from 'path';
import { homedir } from 'os';
const DraftList = () => {
    const [drafts, setDrafts] = useState([]);
    const [selectedIndex, setSelectedIndex] = useState(0);
    const [selectedDraft, setSelectedDraft] = useState(null);
    const { exit } = useApp();
    const draftsDir = join(homedir(), '.notas', 'drafts');
    useEffect(() => {
        if (!draftsDir)
            return;
        try {
            const files = readdirSync(draftsDir).filter(f => f.endsWith('.md'));
            const draftList = files.map(f => {
                const match = f.match(/session_(.+)_(.+)\.md/);
                return {
                    filename: f,
                    sessionId: match ? match[1] : 'unknown',
                    type: match ? match[2] : 'runbook',
                };
            });
            setDrafts(draftList);
        }
        catch (e) {
            // Directory doesn't exist yet
        }
    }, []);
    useInput((input, key) => {
        if (key.escape) {
            if (selectedDraft) {
                setSelectedDraft(null);
            }
            else {
                exit();
            }
        }
        if (key.upArrow) {
            setSelectedIndex(i => Math.max(0, i - 1));
        }
        if (key.downArrow) {
            setSelectedIndex(i => Math.min(drafts.length - 1, i + 1));
        }
        if (key.return && drafts[selectedIndex]) {
            const draftPath = join(draftsDir, drafts[selectedIndex].filename);
            const content = readFileSync(draftPath, 'utf-8');
            setSelectedDraft(content);
        }
        if (key.return && selectedDraft) {
            // Export action would go here
        }
    });
    if (selectedDraft) {
        return (React.createElement(Box, { flexDirection: "column" },
            React.createElement(Text, { bold: true }, "\uD83D\uDCC4 Draft Preview (Press ESC to go back)"),
            React.createElement(Box, { borderStyle: "single", borderColor: "gray", paddingX: 1, marginTop: 1 },
                React.createElement(Text, null,
                    selectedDraft.slice(0, 500),
                    "...")),
            React.createElement(Box, { marginTop: 1 },
                React.createElement(Text, { dimColor: true }, "Actions: [E] Export [ESC] Back"))));
    }
    if (drafts.length === 0) {
        return (React.createElement(Text, { dimColor: true }, "No drafts found. Run 'notas stop <session>' to create one."));
    }
    return (React.createElement(Box, { flexDirection: "column" },
        React.createElement(Text, { bold: true }, "\uD83D\uDCDD Notas Drafts (\u2191/\u2193 to select, Enter to view, ESC to exit)"),
        React.createElement(Box, { marginTop: 1 }, drafts.map((draft, i) => (React.createElement(Box, { key: draft.filename, paddingY: 0 },
            React.createElement(Text, { color: i === selectedIndex ? 'green' : 'white' },
                i === selectedIndex ? '▶ ' : '  ',
                draft.filename)))))));
};
export default DraftList;
