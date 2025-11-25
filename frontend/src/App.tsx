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
    const [editorView, setEditorView] = useState<'edit' | 'preview'>('edit');
    const [refreshKey, setRefreshKey] = useState(0);

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
            setEditorView('edit');
        } catch (err) {
            console.error("Failed to read file", err);
        }
    };

    const handleSave = async () => {
        let targetFile = currentFile;

        if (!targetFile) {
            if (!currentPath) {
                alert("Please open a folder first to save files.");
                return;
            }
            const name = prompt("Enter file name to save (e.g., my-note.md):");
            if (!name) return;

            try {
                await window.go.main.App.CreateFile(currentPath, name);
                // Assume standard separator for now, or just use name if relative works (it might not for SaveFile)
                // We'll construct it manually.
                targetFile = `${currentPath}/${name}`;

                setRefreshKey(prev => prev + 1);
                setCurrentFile(targetFile);
            } catch (err) {
                alert("Failed to create file: " + err);
                return;
            }
        }

        try {
            await window.go.main.App.SaveFile(targetFile, content);
            setIsDirty(false);
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
    }, [content, currentFile, currentPath]);

    return (
        <div className="flex h-screen w-screen overflow-hidden bg-white text-zinc-900">
            <Sidebar
                onFileSelect={handleFileSelect}
                onViewChange={setViewMode}
                onFolderOpen={handleFolderOpen}
                currentWorkspace={currentPath}
                refreshKey={refreshKey}
            />
            <main className="flex-1 flex flex-col overflow-hidden relative bg-white">
                {viewMode === 'editor' && (
                    <div className="h-14 bg-sky-50 border-b border-sky-100 flex items-center px-4 justify-between shadow-sm z-10">
                        <div className="text-sm font-semibold text-slate-700 truncate flex-1 mr-4 flex items-center">
                            <span className="bg-sky-100 text-sky-700 px-2 py-0.5 rounded text-xs mr-2 border border-sky-200">FILE</span>
                            {currentFile ? currentFile.split('/').pop() : "Untitled"} {isDirty && <span className="text-amber-500 ml-1">*</span>}
                        </div>
                        <div className="flex space-x-3">
                            <button
                                onClick={() => setEditorView(editorView === 'edit' ? 'preview' : 'edit')}
                                className="flex items-center px-4 py-1.5 text-xs font-semibold bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-slate-900 rounded-md transition-all shadow-sm"
                            >
                                {editorView === 'edit' ? "Preview" : "Edit"}
                            </button>
                            <button
                                onClick={handleSave}
                                className={`flex items-center px-4 py-1.5 text-xs font-bold rounded-md transition-all shadow-sm ${(currentFile || currentPath)
                                        ? "bg-[#2ea44f] hover:bg-[#2c974b] text-white border border-[rgba(27,31,35,0.15)]"
                                        : "bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200"
                                    }`}
                                disabled={!currentFile && !currentPath}
                                title={!currentFile && !currentPath ? "Open a workspace to save" : "Save"}
                            >
                                <Save className="w-4 h-4 mr-1.5" />
                                Save
                            </button>
                        </div>
                    </div>
                )}

                <div className="flex-1 flex overflow-hidden">
                    {viewMode === 'editor' ? (
                        <div className="w-full h-full">
                            {editorView === 'edit' ? (
                                <Editor content={content} onChange={(val) => { setContent(val); setIsDirty(true); }} />
                            ) : (
                                <Preview content={content} filePath={currentFile} />
                            )}
                        </div>
                    ) : (
                        <Gallery currentPath={currentPath} />
                    )}
                </div>
            </main>
        </div>
    )
}

export default App;
