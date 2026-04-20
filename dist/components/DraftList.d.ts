import React from 'react';
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
declare const DraftList: React.FC<Props>;
export default DraftList;
