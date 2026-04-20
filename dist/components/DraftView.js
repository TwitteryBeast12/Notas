import React from 'react';
import { Box, Text, useInput } from 'ink';
const DraftView = ({ content, onBack, onExport }) => {
    useInput((input, key) => {
        if (key.escape) {
            onBack();
        }
        if (input === 'e' || input === 'E') {
            onExport();
        }
    });
    const preview = content.slice(0, 800);
    return (React.createElement(Box, { flexDirection: "column" },
        React.createElement(Text, { bold: true }, "\uD83D\uDCC4 Draft Preview"),
        React.createElement(Text, { dimColor: true }, "ESC back | E export"),
        React.createElement(Box, { borderStyle: "single", borderColor: "gray", paddingX: 1, marginTop: 1 },
            React.createElement(Text, null,
                preview,
                "..."))));
};
export default DraftView;
