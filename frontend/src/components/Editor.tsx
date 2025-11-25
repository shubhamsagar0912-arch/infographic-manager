import React from 'react';

interface EditorProps {
    content: string;
    onChange: (value: string) => void;
}

const Editor: React.FC<EditorProps> = ({ content, onChange }) => {
    return (
        <textarea
            className="w-full h-full bg-white text-zinc-900 p-8 resize-none focus:outline-none font-mono text-sm leading-relaxed"
            value={content}
            onChange={(e) => onChange(e.target.value)}
            placeholder="Start typing..."
            spellCheck={false}
        />
    );
};

export default Editor;
