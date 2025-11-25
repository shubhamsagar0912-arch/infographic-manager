import React, { useState } from 'react';
import { Folder, Image, FileText, Settings, File } from 'lucide-react';

interface FileInfo {
    name: string;
    path: string;
    isDir: boolean;
}

interface SidebarProps {
    onFileSelect: (path: string) => void;
    onViewChange: (mode: 'editor' | 'gallery') => void;
    onFolderOpen: (path: string) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ onFileSelect, onViewChange, onFolderOpen }) => {
    const [currentPath, setCurrentPath] = useState<string>("");
    const [files, setFiles] = useState<FileInfo[]>([]);

    const handleOpenFolder = async () => {
        try {
            const path = await window.go.main.App.OpenFolder();
            if (path) {
                setCurrentPath(path);
                onFolderOpen(path);
                loadFiles(path);
            }
        } catch (err) {
            console.error("Failed to open folder", err);
        }
    };

    const loadFiles = async (path: string) => {
        try {
            const fileList = await window.go.main.App.ListFiles(path);
            // Sort: Directories first, then files
            fileList.sort((a, b) => {
                if (a.isDir === b.isDir) return a.name.localeCompare(b.name);
                return a.isDir ? -1 : 1;
            });
            setFiles(fileList);
        } catch (err) {
            console.error("Failed to list files", err);
        }
    };

    return (
        <div className="w-64 h-full bg-slate-800 border-r border-slate-700 flex flex-col">
            <div className="p-4 border-b border-slate-700 flex justify-between items-center">
                <h1 className="text-xl font-bold text-blue-400">Infographic Mgr</h1>
            </div>

            <div className="flex-1 overflow-y-auto py-4">
                <div className="px-4 mb-2 flex justify-between items-center">
                    <span className="text-xs font-semibold text-slate-400 uppercase">Explorer</span>
                    <button onClick={handleOpenFolder} className="text-xs text-blue-400 hover:text-blue-300">
                        Open
                    </button>
                </div>

                {currentPath ? (
                    <div className="px-2">
                        <div className="text-xs text-slate-500 mb-2 truncate" title={currentPath}>{currentPath}</div>
                        <div className="space-y-1">
                            {files.map((file) => (
                                <div
                                    key={file.path}
                                    className="flex items-center px-2 py-1 text-sm text-slate-300 hover:bg-slate-700 rounded cursor-pointer"
                                    onClick={() => !file.isDir && onFileSelect(file.path)}
                                >
                                    {file.isDir ? (
                                        <Folder className="w-4 h-4 mr-2 text-yellow-500" />
                                    ) : (
                                        <File className="w-4 h-4 mr-2 text-slate-400" />
                                    )}
                                    <span className="truncate">{file.name}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                ) : (
                    <div className="px-4 py-2 text-sm text-slate-500 italic">
                        No folder opened
                    </div>
                )}
            </div>

            <div className="p-4 border-t border-slate-700">
                <nav className="space-y-1">
                    <button
                        onClick={() => onViewChange('gallery')}
                        className="flex items-center w-full px-2 py-2 text-sm font-medium text-slate-300 rounded-md hover:bg-slate-700 hover:text-white"
                    >
                        <Image className="mr-3 h-5 w-5" />
                        Gallery
                    </button>
                    <button
                        onClick={() => onViewChange('editor')}
                        className="flex items-center w-full px-2 py-2 text-sm font-medium text-slate-300 rounded-md hover:bg-slate-700 hover:text-white"
                    >
                        <FileText className="mr-3 h-5 w-5" />
                        Editor
                    </button>
                    <button className="flex items-center w-full px-2 py-2 text-sm font-medium text-slate-300 rounded-md hover:bg-slate-700 hover:text-white">
                        <Settings className="mr-3 h-5 w-5" />
                        Settings
                    </button>
                </nav>
            </div>
        </div>
    );
};

export default Sidebar;
