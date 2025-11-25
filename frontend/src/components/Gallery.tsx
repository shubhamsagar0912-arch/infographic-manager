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
        if (!currentPath) return;

        const loadImages = async () => {
            try {
                const files = await window.go.main.App.ListFiles(currentPath);
                const imageFiles = files.filter(f => !f.isDir && /\.(png|jpg|jpeg|gif|webp|svg)$/i.test(f.name));

                const loadedImages = await Promise.all(imageFiles.map(async (file) => {
                    const base64 = await window.go.main.App.ReadBinaryFile(file.path);
                    const ext = file.name.split('.').pop() || 'png';
                    return {
                        name: file.name,
                        path: file.path,
                        src: `data:image/${ext};base64,${base64}`
                    };
                }));
                setImages(loadedImages);
            } catch (err) {
                console.error("Failed to load gallery", err);
            }
        };

        loadImages();
    }, [currentPath]);

    if (!currentPath) return <div className="p-8 text-slate-400">Open a folder to view images.</div>;

    return (
        <div className="h-full w-full bg-slate-50 overflow-y-auto p-8">
            <h2 className="text-2xl font-bold mb-6 text-slate-800 flex items-center">
                <span className="bg-sky-100 text-sky-600 p-2 rounded-lg mr-3">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                </span>
                Gallery
            </h2>

            {images.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-64 text-slate-400 border-2 border-dashed border-slate-200 rounded-xl bg-white">
                    <p>No images found in this folder.</p>
                </div>
            ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {images.map((img, idx) => (
                        <div key={idx} className="group relative bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden hover:shadow-md transition-all hover:-translate-y-1">
                            <div className="aspect-square w-full overflow-hidden bg-slate-100">
                                <img
                                    src={img.src}
                                    alt={img.name}
                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                />
                            </div>
                            <div className="p-3 bg-white border-t border-slate-100">
                                <p className="text-sm font-medium text-slate-700 truncate" title={img.name}>
                                    {img.name}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default Gallery;
