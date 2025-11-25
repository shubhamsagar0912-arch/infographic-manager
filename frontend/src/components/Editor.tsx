import React from 'react';
import { AppSettings } from './Settings';

interface EditorProps {
    content: string;
    onChange: (value: string) => void;
    settings: AppSettings;
}

const Editor: React.FC<EditorProps> = ({ content, onChange, settings }) => {
    return (
        <textarea
            className="w-full h-full bg-white text-zinc-900 p-8 resize-none focus:outline-none leading-relaxed"
            style={{
                fontSize: settings.fontSize,
                fontFamily: settings.fontFamily,
            }}
            value={content}
            onChange={(e) => onChange(e.target.value)}
            placeholder="Start typing..."
            spellCheck={false}
        />
    );
};

export default Editor;
