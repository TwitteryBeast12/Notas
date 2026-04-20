import React from 'react';
interface Props {
    content: string;
    sessionId: string;
    onBack: () => void;
    onExportComplete: () => void;
}
declare const ExportView: React.FC<Props>;
export default ExportView;
