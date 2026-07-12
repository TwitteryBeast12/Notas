import React, { useState, useEffect } from 'react';
import { Box, Text } from 'ink';
import { readdirSync, readFileSync } from 'fs';
import { join } from 'path';
import { homedir } from 'os';
import DraftList from './components/DraftList.js';
import DraftView from './components/DraftView.js';
import ExportView from './components/ExportView.js';
import { DraftLike } from './draftFilter.js';

type Draft = DraftLike;

const App: React.FC = () => {
  const [view, setView] = useState<'list' | 'preview' | 'export'>('list');
  const [drafts, setDrafts] = useState<Draft[]>([]);
  const [selectedDraft, setSelectedDraft] = useState<Draft | null>(null);
  const [draftContent, setDraftContent] = useState<string>('');

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
    } catch (e) {
      // Directory doesn't exist
    }
  }, []);

  const handleSelect = (draft: Draft) => {
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
    setView('export');
  };

  const handleExportComplete = () => {
    setView('list');
    setSelectedDraft(null);
    setDraftContent('');
  };

  if (view === 'export' && selectedDraft) {
    return (
      <ExportView
        content={draftContent}
        sessionId={selectedDraft.sessionId}
        onBack={handleBack}
        onExportComplete={handleExportComplete}
      />
    );
  }

  if (view === 'preview' && selectedDraft) {
    return (
      <DraftView content={draftContent} onBack={handleBack} onExport={handleExport} />
    );
  }

  return (
    <DraftList drafts={drafts} onSelect={handleSelect} onExit={() => process.exit(0)} />
  );
};

export default App;
