import React, { useState } from 'react';
import { Box, Text, useInput } from 'ink';
const ExportView = ({ content, sessionId, onBack, onExportComplete }) => {
    const [selected, setSelected] = useState(0);
    const [exporting, setExporting] = useState(false);
    const [result, setResult] = useState(null);
    const options = [
        { id: 'local', label: 'Local (~/.notas/final/)' },
        { id: 'github', label: 'GitHub (requires config)' },
        { id: 'notion', label: 'Notion (requires config)' },
    ];
    useInput(async (input, key) => {
        if (key.escape) {
            onBack();
        }
        if (key.upArrow) {
            setSelected(s => Math.max(0, s - 1));
        }
        if (key.downArrow) {
            setSelected(s => Math.min(options.length - 1, s - 1));
        }
        if (key.return && !exporting) {
            setExporting(true);
            const target = options[selected].id;
            try {
                // Dynamic import to avoid circular deps
                const { NotasExporter, loadConfig } = await import('../exporter.js');
                if (target === 'local') {
                    const exporter = new NotasExporter({ github: { repo: '', token: '' }, notion: { page_id: '', token: '' } });
                    const result = exporter.exportLocal(`session_${sessionId}_final.md`, content);
                    setResult(`✅ Exported locally: ${result.path}`);
                }
                else {
                    const config = loadConfig();
                    const exporter = new NotasExporter(config);
                    if (target === 'github') {
                        const result = await exporter.exportToGithub(`runbooks/session_${sessionId}.md`, content);
                        setResult(`✅ Exported to GitHub: ${result.url}`);
                    }
                    else if (target === 'notion') {
                        const result = await exporter.exportToNotion(`Session ${sessionId}`, content);
                        setResult(`✅ Exported to Notion: ${result.url}`);
                    }
                }
                setTimeout(() => {
                    onExportComplete();
                }, 2000);
            }
            catch (e) {
                setResult(`❌ Export failed: ${e.message}`);
            }
        }
    });
    return (React.createElement(Box, { flexDirection: "column" },
        React.createElement(Text, { bold: true }, "\uD83D\uDE80 Export Draft"),
        React.createElement(Text, { dimColor: true }, "\u2191/\u2193 select | Enter export | ESC back"),
        exporting && !result && (React.createElement(Box, { marginTop: 1 },
            React.createElement(Text, { color: "yellow" }, "Exporting..."))),
        result && (React.createElement(Box, { marginTop: 1 },
            React.createElement(Text, null, result))),
        React.createElement(Box, { marginTop: 1, flexDirection: "column" }, options.map((opt, i) => (React.createElement(Box, { key: opt.id, paddingY: 0 },
            React.createElement(Text, { color: i === selected ? 'green' : 'white' },
                i === selected ? '▶ ' : '  ',
                opt.label)))))));
};
export default ExportView;
