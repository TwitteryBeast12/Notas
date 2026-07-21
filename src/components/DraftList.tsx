import React, { useState, useEffect } from 'react';
import { Box, Text, useInput } from 'ink';
import { filterDrafts, DraftLike } from '../draftFilter.js';

interface Props {
  drafts: DraftLike[];
  onSelect: (draft: DraftLike) => void;
  onExit: () => void;
}

const DraftList: React.FC<Props> = ({ drafts, onSelect, onExit }) => {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [query, setQuery] = useState('');

  const filtered = filterDrafts(drafts, query);

  // Keep the selection in range as the filtered list shrinks/grows.
  useEffect(() => {
    setSelectedIndex((i) => Math.min(Math.max(0, i), Math.max(0, filtered.length - 1)));
  }, [filtered.length]);

  const resetQuery = () => setQuery('');

  useInput((input, key) => {
    if (key.escape) {
      if (query) {
        resetQuery();
      } else {
        onExit();
      }
      return;
    }
    if (key.backspace || key.delete) {
      setQuery((q) => q.slice(0, -1));
      return;
    }
    if (key.upArrow) {
      setSelectedIndex((i) => Math.max(0, i - 1));
      return;
    }
    if (key.downArrow) {
      setSelectedIndex((i) => Math.min(filtered.length - 1, i + 1));
      return;
    }
    if (key.return) {
      const sel = filtered[selectedIndex];
      if (sel) onSelect(sel);
      return;
    }
    // Any printable character refines the filter.
    if (input && !key.ctrl && !key.meta) {
      setQuery((q) => q + input);
    }
  });

  if (drafts.length === 0) {
    return (
      <Box flexDirection="column">
        <Text dimColor>No drafts found.</Text>
        <Text dimColor>Run 'notas stop &lt;session&gt;' to create one.</Text>
      </Box>
    );
  }

  return (
    <Box flexDirection="column">
      <Text bold>📝 Notas Drafts</Text>
      <Box>
        <Text dimColor>{query ? `filter: "${query}"` : '↑/↓ select | type to filter | Enter view | ESC'}{query ? ' (ESC clears)' : ' exit'}</Text>
      </Box>
      <Box marginTop={1}>
        {filtered.length === 0 ? (
          <Text dimColor>No drafts match "{query}".</Text>
        ) : (
          filtered.map((draft, i) => (
            <Box key={draft.filename} paddingY={0}>
              <Text color={i === selectedIndex ? 'green' : 'white'}>
                {i === selectedIndex ? '▶ ' : '  '}
                {draft.filename}
              </Text>
            </Box>
          ))
        )}
      </Box>
    </Box>
  );
};

export default DraftList;
