import React, { useState, useEffect } from 'react';

interface GalleryProps {
    currentPath: string | null;
}

interface ImageFile {
    name: string;
    path: string;
    src: string;
}

const Gallery: React.FC<GalleryProps> = ({ currentPath }) => {
    const [images, setImages] = useState<ImageFile[]>([]);

    useEffect(() => {
        if (currentPath) {
            loadImages(currentPath);
        }
    }, [currentPath]);

    const loadImages = async (path: string) => {
        try {
            const files = await window.go.main.App.ListFiles(path);
            const imageFiles = files.filter(f =>
                !f.isDir && /\.(png|jpg|jpeg|gif|webp|svg)$/i.test(f.name)
            );

            const loadedImages = await Promise.all(imageFiles.map(async (f) => {
                try {
                    // ReadBinaryFile returns base64 string in Wails
                    const base64 = await window.go.main.App.ReadBinaryFile(f.path);
                    return {
                        name: f.name,
                        path: f.path,
                        src: `data:image/${f.name.split('.').pop()};base64,${base64}`
                    };
                } catch (e) {
                    console.error("Failed to load image", f.name, e);
                    return null;
                }
            }));

            setImages(loadedImages.filter((img): img is ImageFile => img !== null));
        } catch (err) {
            console.error("Failed to load images", err);
        }
    };

    if (!currentPath) {
        return (
            <div className="h-full flex items-center justify-center text-slate-500">
                Open a folder to view images
            </div>
        );
    }

    return (
        <div className="h-full w-full bg-slate-900 overflow-y-auto p-6">
            <h2 className="text-xl font-bold mb-6 text-slate-200">Gallery</h2>
            {images.length === 0 ? (
                <div className="text-slate-500 italic">No images found in this folder.</div>
            ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {images.map((img) => (
                        <div key={img.path} className="group relative bg-slate-800 rounded-lg overflow-hidden border border-slate-700 hover:border-blue-500 transition-all">
                            <div className="aspect-square overflow-hidden bg-slate-950">
                                <img
                                    src={img.src}
                                    alt={img.name}
                                    className="w-full h-full object-cover opacity-70 group-hover:opacity-100 transition-opacity"
                                />
                            </div>
                            <div className="p-3">
                                <p className="text-sm text-slate-300 truncate" title={img.name}>{img.name}</p>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default Gallery;
