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
    onViewChange: (mode: 'editor' | 'gallery' | 'settings') => void;
    onFolderOpen: (path: string) => void;
    currentWorkspace: string | null;
    refreshKey?: number;
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
                setExpanded(false);
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
                className="flex items-center px-2 py-1.5 text-sm text-slate-600 hover:bg-sky-50 hover:text-[#0969da] rounded cursor-pointer group relative transition-colors"
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
                    <span className="mr-1.5 text-slate-400 group-hover:text-sky-500">
                        {expanded ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
                    </span>
                )}

                {file.isDir ? (
                    <Folder className="w-4 h-4 mr-2 text-sky-200 fill-sky-400" />
                ) : (
                    <File className="w-4 h-4 mr-2 text-slate-400" />
                )}
                <span className="truncate flex-1 font-medium">{file.name}</span>

                {/* Context Menu Trigger (Hover) */}
                {file.isDir && (
                    <div className="hidden group-hover:flex space-x-1">
                        <button
                            onClick={handleCreateFile}
                            className="p-1 hover:bg-sky-100 rounded text-slate-400 hover:text-sky-600"
                            title="New File"
                        >
                            <Plus className="w-3 h-3" />
                        </button>
                    </div>
                )}
            </div>

            {/* Simple Context Menu */}
            {showMenu && (
                <div className="fixed z-50 bg-white border border-slate-200 rounded-md shadow-lg p-1 text-xs min-w-[120px]"
                    style={{ left: '200px' }}
                    onMouseLeave={() => setShowMenu(false)}
                >
                    <button onClick={handleCreateFile} className="block w-full text-left px-3 py-1.5 hover:bg-sky-50 text-slate-700 hover:text-[#0969da] rounded-sm mb-0.5">New Note</button>
                    <button onClick={handleCreateFolder} className="block w-full text-left px-3 py-1.5 hover:bg-sky-50 text-slate-700 hover:text-[#0969da] rounded-sm mb-0.5">New Folder</button>
                    <button onClick={handleImport} className="block w-full text-left px-3 py-1.5 hover:bg-sky-50 text-slate-700 hover:text-[#0969da] rounded-sm">Import File</button>
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

const Sidebar: React.FC<SidebarProps> = ({ onFileSelect, onViewChange, onFolderOpen, currentWorkspace, refreshKey }) => {
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
    }, [currentWorkspace, refreshKey]);

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

    const handleCreateFileRoot = async () => {
        if (!currentWorkspace) return;
        const name = prompt("Enter file name (e.g., note.md):");
        if (name) {
            try {
                await window.go.main.App.CreateFile(currentWorkspace, name);
                loadFiles(currentWorkspace);
            } catch (err) {
                alert("Failed to create file: " + err);
            }
        }
    };

    const handleCreateFolderRoot = async () => {
        if (!currentWorkspace) return;
        const name = prompt("Enter folder name:");
        if (name) {
            try {
                await window.go.main.App.CreateDirectory(currentWorkspace, name);
                loadFiles(currentWorkspace);
            } catch (err) {
                alert("Failed to create folder: " + err);
            }
        }
    };

    return (
        <div className="w-64 h-full bg-slate-50 border-r border-slate-200 flex flex-col shadow-[1px_0_5px_rgba(0,0,0,0.05)] z-20">
            <div className="p-4 border-b border-slate-200 flex justify-between items-center bg-slate-50">
                <h1 className="text-lg font-bold text-slate-800 flex items-center">
                    <span className="w-2 h-6 bg-[#2ea44f] rounded-full mr-2"></span>
                    Infographic
                </h1>
            </div>

            <div className="flex-1 overflow-y-auto py-4">
                <div className="px-4 mb-2 flex justify-between items-center">
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Explorer</span>
                    <div className="flex space-x-2">
                        {currentWorkspace && (
                            <>
                                <button onClick={handleCreateFileRoot} className="text-slate-400 hover:text-[#2ea44f]" title="New File">
                                    <Plus className="w-4 h-4" />
                                </button>
                                <button onClick={handleCreateFolderRoot} className="text-slate-400 hover:text-[#2ea44f]" title="New Folder">
                                    <Folder className="w-4 h-4" />
                                </button>
                            </>
                        )}
                        <button onClick={handleOpenFolder} className="text-xs font-semibold text-[#0969da] hover:underline ml-2">
                            {currentWorkspace ? "Change" : "Open"}
                        </button>
                    </div>
                </div>

                {currentWorkspace ? (
                    <div className="px-2">
                        <div className="text-xs font-medium text-slate-500 mb-3 truncate px-2 py-1 bg-slate-100 rounded border border-slate-200" title={currentWorkspace}>
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
                    <div className="px-4 py-8 text-center">
                        <div className="text-sm text-slate-500 mb-2">No workspace open</div>
                        <button onClick={handleOpenFolder} className="text-xs bg-white border border-slate-300 px-3 py-1 rounded shadow-sm hover:bg-slate-50 text-slate-700">
                            Open Folder
                        </button>
                    </div>
                )}
            </div>

            <div className="p-3 border-t border-slate-200 bg-slate-50">
                <nav className="space-y-1">
                    <button
                        onClick={() => onViewChange('gallery')}
                        className="flex items-center w-full px-3 py-2 text-sm font-medium text-slate-600 rounded-md hover:bg-white hover:text-[#0969da] hover:shadow-sm hover:border-slate-200 border border-transparent transition-all"
                    >
                        <Image className="mr-3 h-4 w-4" />
                        Gallery
                    </button>
                    <button
                        onClick={() => onViewChange('editor')}
                        className="flex items-center w-full px-3 py-2 text-sm font-medium text-slate-600 rounded-md hover:bg-white hover:text-[#0969da] hover:shadow-sm hover:border-slate-200 border border-transparent transition-all"
                    >
                        <FileText className="mr-3 h-4 w-4" />
                        Editor
                    </button>
                    <button
                        onClick={() => onViewChange('settings')}
                        className="flex items-center w-full px-3 py-2 text-sm font-medium text-slate-600 rounded-md hover:bg-white hover:text-[#0969da] hover:shadow-sm hover:border-slate-200 border border-transparent transition-all"
                    >
                        <Settings className="mr-3 h-4 w-4" />
                        Settings
                    </button>
                </nav>
            </div>
        </div>
    );
};

export default Sidebar;
