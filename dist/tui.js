import React, { useState, useEffect } from 'react';
import { Box, Text } from 'ink';
import { readdirSync, readFileSync } from 'fs';
import { join } from 'path';
import { homedir } from 'os';
import DraftList from './components/DraftList.js';
import DraftView from './components/DraftView.js';
const App = () => {
    const [view, setView] = useState('list');
    const [drafts, setDrafts] = useState([]);
    const [selectedDraft, setSelectedDraft] = useState(null);
    const [draftContent, setDraftContent] = useState('');
    const draftsDir = join(homedir(), '.notas', 'drafts');
    useEffect(() => {
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
            // Directory doesn't exist
        }
    });
    const handleSelect = (draft) => {
        const content = readFileSync(join(draftsDir, draft.filename), 'utf-8');
        setSelectedDraft(draft);
        setDraftContent(content);
        setView('preview');
    };
    const handleBack = () => {
        setSelectedDraft(null);
        setDraftContent('');
        setView('list');
    };
    const handleExport = () => {
        // Export logic would be called here
        setView('export');
    };
    if (view === 'export') {
        return (React.createElement(Box, { flexDirection: "column" },
            React.createElement(Text, { bold: true }, "\uD83D\uDE80 Export"),
            React.createElement(Text, null, "Export functionality coming soon."),
            React.createElement(Text, { dimColor: true }, "Press ESC to go back.")));
    }
    if (view === 'preview' && selectedDraft) {
        return (React.createElement(DraftView, { content: draftContent, onBack: handleBack, onExport: handleExport }));
    }
    return (React.createElement(DraftList, { drafts: drafts, onSelect: handleSelect, onExit: () => process.exit(0) }));
};
export default App;
