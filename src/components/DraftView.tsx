import React from 'react';
import { Box, Text, useInput, useApp } from 'ink';

interface Props {
  content: string;
  onBack: () => void;
  onExport: () => void;
}

const DraftView: React.FC<Props> = ({ content, onBack, onExport }) => {
  useInput((input, key) => {
    if (key.escape) {
      onBack();
    }
    if (input === 'e' || input === 'E') {
      onExport();
    }
  });

  const preview = content.slice(0, 800);

  return (
    <Box flexDirection="column">
      <Text bold>📄 Draft Preview</Text>
      <Text dimColor>ESC back | E export</Text>
      <Box borderStyle="single" borderColor="gray" paddingX={1} marginTop={1}>
        <Text>{preview}...</Text>
      </Box>
    </Box>
  );
};

export default DraftView;
