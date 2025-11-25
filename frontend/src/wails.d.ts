export { };

declare global {
    interface Window {
        go: {
            main: {
                App: {
                    OpenFolder: () => Promise<string>;
                    ListFiles: (dirPath: string) => Promise<Array<{ name: string, path: string, isDir: boolean }>>;
                    ReadTextFile: (filePath: string) => Promise<string>;
                    ReadBinaryFile: (filePath: string) => Promise<string>; // Wails returns base64 string for []byte
                    SaveFile: (filePath: string, content: string) => Promise<void>;
                };
            };
        };
    }
}
