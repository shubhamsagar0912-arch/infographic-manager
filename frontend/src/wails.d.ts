export { };

declare global {
    interface Window {
        go: {
            main: {
                App: {
                    OpenFolder: () => Promise<string>;
                    ListFiles: (dirPath: string) => Promise<Array<{ name: string, path: string, isDir: boolean }>>;
                    ReadTextFile: (filePath: string) => Promise<string>;
                    ReadBinaryFile: (filePath: string) => Promise<string>;
                    SaveFile: (filePath: string, content: string) => Promise<void>;
                    CreateFile: (parentPath: string, name: string) => Promise<void>;
                    CreateDirectory: (parentPath: string, name: string) => Promise<void>;
                    ImportFile: (destDir: string) => Promise<void>;
                };
            };
        };
    }
}
