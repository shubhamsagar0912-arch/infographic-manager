import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import Editor from './components/Editor';
import Preview from './components/Preview';
import Gallery from './components/Gallery';
import { Save } from 'lucide-react';

function App() {
    const [content, setContent] = useState<string>("# Welcome\n\nSelect a file to edit or start typing.");
    const [currentFile, setCurrentFile] = useState<string | null>(null);
    const [currentPath, setCurrentPath] = useState<string | null>(localStorage.getItem('lastWorkspace'));
    const [isDirty, setIsDirty] = useState(false);
    const [viewMode, setViewMode] = useState<'editor' | 'gallery'>('editor');

    const handleFileSelect = async (path: string) => {
        if (isDirty) {
            if (!confirm("You have unsaved changes. Discard them?")) return;
        }
        try {
            const fileContent = await window.go.main.App.ReadTextFile(path);
            setContent(fileContent);
            setCurrentFile(path);
            setIsDirty(false);
            setViewMode('editor');
        } catch (err) {
            console.error("Failed to read file", err);
        }
    };

    const handleSave = async () => {
        if (!currentFile) return;
        try {
            await window.go.main.App.SaveFile(currentFile, content);
            setIsDirty(false);
            alert("Saved!");
        } catch (err) {
            console.error("Failed to save file", err);
            alert("Failed to save");
        }
    };

    const handleFolderOpen = (path: string) => {
        setCurrentPath(path);
        localStorage.setItem('lastWorkspace', path);
    };

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if ((e.metaKey || e.ctrlKey) && e.key === 's') {
                e.preventDefault();
                handleSave();
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [content, currentFile]);

    return (
        <div className="flex h-screen w-screen overflow-hidden bg-slate-900 text-white">
            <Sidebar
                onFileSelect={handleFileSelect}
                onViewChange={setViewMode}
                onFolderOpen={handleFolderOpen}
                currentWorkspace={currentPath}
            />
            <main className="flex-1 flex flex-col overflow-hidden relative">
                {viewMode === 'editor' && (
                    <div className="h-12 bg-slate-800 border-b border-slate-700 flex items-center px-4 justify-between">
                        <div className="text-sm text-slate-400 truncate">
                            {currentFile || "Untitled"} {isDirty && "*"}
                        </div>
                        <div className="flex space-x-2">
                            <button
                                onClick={handleSave}
                                disabled={!currentFile}
                                className={`flex items-center px-3 py-1.5 text-xs font-medium rounded transition-colors ${currentFile
                                        ? "bg-blue-600 hover:bg-blue-500 text-white"
                                        : "bg-slate-700 text-slate-500 cursor-not-allowed"
                                    }`}
                            >
                                <Save className="w-4 h-4 mr-1.5" />
                                Save
                            </button>
                        </div>
                    </div>
                )}

                <div className="flex-1 flex overflow-hidden">
                    {viewMode === 'editor' ? (
                        <>
                            <div className="w-1/2 border-r border-slate-700">
                                <Editor content={content} onChange={(val) => { setContent(val); setIsDirty(true); }} />
                            </div>
                            <div className="w-1/2">
                                <Preview content={content} filePath={currentFile} />
                            </div>
                        </>
                    ) : (
                        <Gallery currentPath={currentPath} />
                    )}
                </div>
            </main>
        </div>
    )
}

export default App;
