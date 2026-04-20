import React, { useState, useEffect } from 'react';
import { Box, Text, useInput, useApp } from 'ink';

interface Draft {
  filename: string;
  sessionId: string;
  type: string;
}

interface Props {
  drafts: Draft[];
  onSelect: (draft: Draft) => void;
  onExit: () => void;
}

const DraftList: React.FC<Props> = ({ drafts, onSelect, onExit }) => {
  const [selectedIndex, setSelectedIndex] = useState(0);

  useInput((input, key) => {
    if (key.escape) {
      onExit();
    }
    if (key.upArrow) {
      setSelectedIndex(i => Math.max(0, i - 1));
    }
    if (key.downArrow) {
      setSelectedIndex(i => Math.min(drafts.length - 1, i + 1));
    }
    if (key.return && drafts[selectedIndex]) {
      onSelect(drafts[selectedIndex]);
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
      <Text dimColor>↑/↓ select | Enter view | ESC exit</Text>
      <Box marginTop={1}>
        {drafts.map((draft, i) => (
          <Box key={draft.filename} paddingY={0}>
            <Text color={i === selectedIndex ? 'green' : 'white'}>
              {i === selectedIndex ? '▶ ' : '  '}
              {draft.filename}
            </Text>
          </Box>
        ))}
      </Box>
    </Box>
  );
};

export default DraftList;
