import React from 'react';
import { Type, Monitor } from 'lucide-react';

export interface AppSettings {
    fontSize: string;
    fontFamily: string;
}

interface SettingsProps {
    settings: AppSettings;
    onSettingsChange: (newSettings: AppSettings) => void;
}

const Settings: React.FC<SettingsProps> = ({ settings, onSettingsChange }) => {
    const fontSizes = ['12px', '14px', '16px', '18px', '20px', '24px'];
    const fontFamilies = [
        { name: 'Nunito (Default)', value: '"Nunito", sans-serif' },
        { name: 'Monospace', value: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace' },
        { name: 'Serif', value: 'ui-serif, Georgia, Cambria, "Times New Roman", Times, serif' },
        { name: 'Sans-serif', value: 'ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif' },
    ];

    const handleChange = (key: keyof AppSettings, value: string) => {
        onSettingsChange({
            ...settings,
            [key]: value,
        });
    };

    return (
        <div className="h-full w-full bg-slate-50 overflow-y-auto p-8">
            <h2 className="text-2xl font-bold mb-6 text-slate-800 flex items-center">
                <span className="bg-sky-100 text-sky-600 p-2 rounded-lg mr-3">
                    <SettingsIcon className="w-6 h-6" />
                </span>
                Settings
            </h2>

            <div className="max-w-2xl bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="p-6 border-b border-slate-100">
                    <h3 className="text-lg font-semibold text-slate-800 mb-1 flex items-center">
                        <Type className="w-5 h-5 mr-2 text-slate-500" />
                        Typography
                    </h3>
                    <p className="text-sm text-slate-500">Customize how your text looks in the editor and preview.</p>
                </div>

                <div className="p-6 space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">Font Size</label>
                        <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                            {fontSizes.map((size) => (
                                <button
                                    key={size}
                                    onClick={() => handleChange('fontSize', size)}
                                    className={`px-3 py-2 text-sm border rounded-md transition-all ${settings.fontSize === size
                                            ? 'bg-sky-50 border-sky-500 text-sky-700 font-semibold ring-1 ring-sky-500'
                                            : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-50'
                                        }`}
                                >
                                    {size}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">Font Family</label>
                        <div className="space-y-2">
                            {fontFamilies.map((font) => (
                                <button
                                    key={font.name}
                                    onClick={() => handleChange('fontFamily', font.value)}
                                    className={`w-full text-left px-4 py-3 border rounded-lg transition-all flex items-center justify-between ${settings.fontFamily === font.value
                                            ? 'bg-sky-50 border-sky-500 ring-1 ring-sky-500'
                                            : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                                        }`}
                                >
                                    <span className="text-slate-700 font-medium">{font.name}</span>
                                    <span className="text-slate-400 text-sm truncate ml-4 max-w-xs" style={{ fontFamily: font.value }}>
                                        The quick brown fox jumps over the lazy dog
                                    </span>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="p-4 bg-slate-50 border-t border-slate-200 text-xs text-slate-500 text-center">
                    Settings are automatically saved to your browser.
                </div>
            </div>
        </div>
    );
};

// Helper icon component since we can't import Settings from lucide-react inside the component if it conflicts with the component name
const SettingsIcon = ({ className }: { className?: string }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
);

export default Settings;
