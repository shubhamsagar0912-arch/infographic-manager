import React from 'react';

interface EditorProps {
    content: string;
    onChange: (value: string) => void;
}

const Editor: React.FC<EditorProps> = ({ content, onChange }) => {
    return (
        <div className="h-full w-full flex flex-col">
            <div className="bg-slate-800 px-4 py-2 border-b border-slate-700 text-sm font-medium text-slate-300">
                Markdown Editor
            </div>
            <textarea
                className="flex-1 w-full h-full bg-slate-900 text-slate-200 p-4 font-mono text-sm resize-none focus:outline-none"
                value={content}
                onChange={(e) => onChange(e.target.value)}
                placeholder="# Start typing markdown..."
            />
        </div>
    );
};

export default Editor;
