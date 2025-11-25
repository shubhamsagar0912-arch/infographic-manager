import React, { useState, useEffect } from 'react';
import { Folder, Image, FileText, Settings, File, ChevronRight, ChevronDown, Plus, Upload } from 'lucide-react';

interface FileInfo {
    name: string;
    path: string;
    isDir: boolean;
    children?: FileInfo[];
}

interface SidebarProps {
    onFileSelect: (path: string) => void;
    onViewChange: (mode: 'editor' | 'gallery') => void;
    onFolderOpen: (path: string) => void;
    currentWorkspace: string | null;
}

const FileTreeItem = ({ file, onSelect, onToggle, depth = 0, onRefresh }: {
    file: FileInfo,
    onSelect: (path: string) => void,
    onToggle: (path: string) => void,
    depth?: number,
    onRefresh: () => void
}) => {
    const [expanded, setExpanded] = useState(false);
    const [children, setChildren] = useState<FileInfo[]>([]);
    const [showMenu, setShowMenu] = useState(false);

    const handleToggle = async (e: React.MouseEvent) => {
        e.stopPropagation();
        if (file.isDir) {
            if (!expanded) {
                try {
                    const list = await window.go.main.App.ListFiles(file.path);
                    list.sort((a, b) => {
                        if (a.isDir === b.isDir) return a.name.localeCompare(b.name);
                        return a.isDir ? -1 : 1;
                    });
                    setChildren(list);
                } catch (err) {
                    console.error("Failed to load children", err);
                }
            }
            setExpanded(!expanded);
        }
    };

    const handleCreateFile = async (e: React.MouseEvent) => {
        e.stopPropagation();
        const name = prompt("Enter file name (e.g., note.md):");
        if (name) {
            try {
                await window.go.main.App.CreateFile(file.path, name);
                // Refresh children
                setExpanded(false); // Collapse to force reload or manually reload
                handleToggle(e as any);
                onRefresh();
            } catch (err) {
                alert("Failed to create file: " + err);
            }
        }
        setShowMenu(false);
    };

    const handleCreateFolder = async (e: React.MouseEvent) => {
        e.stopPropagation();
        const name = prompt("Enter folder name:");
        if (name) {
            try {
                await window.go.main.App.CreateDirectory(file.path, name);
                setExpanded(false);
                handleToggle(e as any);
                onRefresh();
            } catch (err) {
                alert("Failed to create folder: " + err);
            }
        }
        setShowMenu(false);
    };

    const handleImport = async (e: React.MouseEvent) => {
        e.stopPropagation();
        try {
            await window.go.main.App.ImportFile(file.path);
            setExpanded(false);
            handleToggle(e as any);
            onRefresh();
        } catch (err) {
            console.error("Import failed", err);
        }
        setShowMenu(false);
    };

    return (
        <div className="select-none">
            <div
                className="flex items-center px-2 py-1 text-sm text-slate-300 hover:bg-slate-700 rounded cursor-pointer group relative"
                style={{ paddingLeft: `${depth * 12 + 8}px` }}
                onClick={(e) => {
                    if (file.isDir) handleToggle(e);
                    else onSelect(file.path);
                }}
                onContextMenu={(e) => {
                    e.preventDefault();
                    if (file.isDir) setShowMenu(true);
                }}
            >
                {file.isDir && (
                    <span className="mr-1 text-slate-500">
                        {expanded ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
                    </span>
                )}

                {file.isDir ? (
                    <Folder className="w-4 h-4 mr-2 text-yellow-500" />
                ) : (
                    <File className="w-4 h-4 mr-2 text-slate-400" />
                )}
                <span className="truncate flex-1">{file.name}</span>

                {/* Context Menu Trigger (Hover) */}
                {file.isDir && (
                    <div className="hidden group-hover:flex space-x-1">
                        <button
                            onClick={handleCreateFile}
                            className="p-0.5 hover:bg-slate-600 rounded"
                            title="New File"
                        >
                            <Plus className="w-3 h-3 text-slate-400" />
                        </button>
                    </div>
                )}
            </div>

            {/* Simple Context Menu */}
            {showMenu && (
                <div className="fixed z-50 bg-slate-800 border border-slate-600 rounded shadow-xl p-1 text-xs"
                    style={{ left: '200px' }} // Positioning needs improvement, simplified for now
                    onMouseLeave={() => setShowMenu(false)}
                >
                    <button onClick={handleCreateFile} className="block w-full text-left px-2 py-1 hover:bg-slate-700 rounded mb-1">New Note</button>
                    <button onClick={handleCreateFolder} className="block w-full text-left px-2 py-1 hover:bg-slate-700 rounded mb-1">New Folder</button>
                    <button onClick={handleImport} className="block w-full text-left px-2 py-1 hover:bg-slate-700 rounded">Import File</button>
                </div>
            )}

            {expanded && children.map(child => (
                <FileTreeItem
                    key={child.path}
                    file={child}
                    onSelect={onSelect}
                    onToggle={onToggle}
                    depth={depth + 1}
                    onRefresh={onRefresh}
                />
            ))}
        </div>
    );
};

const Sidebar: React.FC<SidebarProps> = ({ onFileSelect, onViewChange, onFolderOpen, currentWorkspace }) => {
    const [files, setFiles] = useState<FileInfo[]>([]);

    const loadFiles = async (path: string) => {
        try {
            const fileList = await window.go.main.App.ListFiles(path);
            fileList.sort((a, b) => {
                if (a.isDir === b.isDir) return a.name.localeCompare(b.name);
                return a.isDir ? -1 : 1;
            });
            setFiles(fileList);
        } catch (err) {
            console.error("Failed to list files", err);
        }
    };

    useEffect(() => {
        if (currentWorkspace) {
            loadFiles(currentWorkspace);
        }
    }, [currentWorkspace]);

    const handleOpenFolder = async () => {
        try {
            const path = await window.go.main.App.OpenFolder();
            if (path) {
                onFolderOpen(path);
            }
        } catch (err) {
            console.error("Failed to open folder", err);
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
                        {currentWorkspace ? "Change" : "Open"}
                    </button>
                </div>

                {currentWorkspace ? (
                    <div className="px-2">
                        <div className="text-xs text-slate-500 mb-2 truncate px-2" title={currentWorkspace}>
                            {currentWorkspace.split('/').pop()}
                        </div>
                        <div className="space-y-0.5">
                            {files.map((file) => (
                                <FileTreeItem
                                    key={file.path}
                                    file={file}
                                    onSelect={onFileSelect}
                                    onToggle={() => { }}
                                    onRefresh={() => loadFiles(currentWorkspace)}
                                />
                            ))}
                        </div>
                    </div>
                ) : (
                    <div className="px-4 py-2 text-sm text-slate-500 italic">
                        No workspace opened
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
