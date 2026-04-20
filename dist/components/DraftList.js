import React, { useState } from 'react';
import { Box, Text, useInput } from 'ink';
const DraftList = ({ drafts, onSelect, onExit }) => {
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
        return (React.createElement(Box, { flexDirection: "column" },
            React.createElement(Text, { dimColor: true }, "No drafts found."),
            React.createElement(Text, { dimColor: true }, "Run 'notas stop <session>' to create one.")));
    }
    return (React.createElement(Box, { flexDirection: "column" },
        React.createElement(Text, { bold: true }, "\uD83D\uDCDD Notas Drafts"),
        React.createElement(Text, { dimColor: true }, "\u2191/\u2193 select | Enter view | ESC exit"),
        React.createElement(Box, { marginTop: 1 }, drafts.map((draft, i) => (React.createElement(Box, { key: draft.filename, paddingY: 0 },
            React.createElement(Text, { color: i === selectedIndex ? 'green' : 'white' },
                i === selectedIndex ? '▶ ' : '  ',
                draft.filename)))))));
};
export default DraftList;
