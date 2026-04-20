import React from 'react';
interface Props {
    content: string;
    onBack: () => void;
    onExport: () => void;
}
declare const DraftView: React.FC<Props>;
export default DraftView;
