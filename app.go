package main

import (
	"context"
	"io"
	"os"
	"path/filepath"

	"github.com/wailsapp/wails/v2/pkg/runtime"
)

// App struct
type App struct {
	ctx context.Context
}

// NewApp creates a new App application struct
func NewApp() *App {
	return &App{}
}

// startup is called when the app starts. The context is saved
// so we can call the runtime methods
func (a *App) startup(ctx context.Context) {
	a.ctx = ctx
}

type FileInfo struct {
	Name  string `json:"name"`
	Path  string `json:"path"`
	IsDir bool   `json:"isDir"`
}

// OpenFolder opens a directory selection dialog
func (a *App) OpenFolder() string {
	selection, err := runtime.OpenDirectoryDialog(a.ctx, runtime.OpenDialogOptions{
		Title: "Select Folder",
	})
	if err != nil {
		return ""
	}
	return selection
}

// ListFiles returns a list of files in the given directory
func (a *App) ListFiles(dirPath string) ([]FileInfo, error) {
	var files []FileInfo
	entries, err := os.ReadDir(dirPath)
	if err != nil {
		return nil, err
	}

	for _, entry := range entries {
		files = append(files, FileInfo{
			Name:  entry.Name(),
			Path:  filepath.Join(dirPath, entry.Name()),
			IsDir: entry.IsDir(),
		})
	}
	return files, nil
}

// ReadTextFile reads the content of a text file
func (a *App) ReadTextFile(filePath string) (string, error) {
	content, err := os.ReadFile(filePath)
	if err != nil {
		return "", err
	}
	return string(content), nil
}

// ReadBinaryFile reads the content of a binary file
func (a *App) ReadBinaryFile(filePath string) ([]byte, error) {
	return os.ReadFile(filePath)
}

// SaveFile saves content to a file
func (a *App) SaveFile(filePath string, content string) error {
	return os.WriteFile(filePath, []byte(content), 0644)
}

// CreateFile creates a new empty file
func (a *App) CreateFile(parentPath string, name string) error {
	fullPath := filepath.Join(parentPath, name)
	file, err := os.Create(fullPath)
	if err != nil {
		return err
	}
	defer file.Close()
	return nil
}

// CreateDirectory creates a new directory
func (a *App) CreateDirectory(parentPath string, name string) error {
	fullPath := filepath.Join(parentPath, name)
	return os.Mkdir(fullPath, 0755)
}

// ImportFile copies a file from source to destination directory
func (a *App) ImportFile(destDir string) error {
	selection, err := runtime.OpenFileDialog(a.ctx, runtime.OpenDialogOptions{
		Title: "Select File to Import",
	})
	if err != nil || selection == "" {
		return err
	}

	srcFile, err := os.Open(selection)
	if err != nil {
		return err
	}
	defer srcFile.Close()

	fileName := filepath.Base(selection)
	destPath := filepath.Join(destDir, fileName)

	destFile, err := os.Create(destPath)
	if err != nil {
		return err
	}
	defer destFile.Close()

	_, err = io.Copy(destFile, srcFile)
	return err
}
