import React, { useEffect, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import mermaid from 'mermaid';

interface PreviewProps {
    content: string;
    filePath?: string | null;
}

mermaid.initialize({
    startOnLoad: false,
    theme: 'dark',
    securityLevel: 'loose',
});

const MermaidBlock = ({ code }: { code: string }) => {
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (ref.current) {
            mermaid.render(`mermaid-${Date.now()}`, code).then((result) => {
                if (ref.current) {
                    ref.current.innerHTML = result.svg;
                }
            }).catch((err) => {
                console.error("Mermaid render error", err);
                if (ref.current) ref.current.innerHTML = `<div class="text-red-500 text-xs">Invalid Mermaid Syntax</div>`;
            });
        }
    }, [code]);

    return <div ref={ref} className="mermaid my-4 flex justify-center" />;
};

const LocalImage = ({ src, alt, filePath }: { src?: string, alt?: string, filePath?: string | null }) => {
    const [imageSrc, setImageSrc] = React.useState<string>("");

    useEffect(() => {
        if (!src) return;
        if (src.startsWith('http')) {
            setImageSrc(src);
            return;
        }

        const loadImage = async () => {
            try {
                let targetPath = src;
                if (!src.startsWith('/') && filePath) {
                    // Simple path resolution for relative paths
                    // Assuming Mac/Linux forward slashes for now as per user OS
                    const lastSlash = filePath.lastIndexOf('/');
                    if (lastSlash !== -1) {
                        const dir = filePath.substring(0, lastSlash);
                        targetPath = `${dir}/${src}`;
                    }
                }

                const base64 = await window.go.main.App.ReadBinaryFile(targetPath);
                const ext = src.split('.').pop() || 'png';
                setImageSrc(`data:image/${ext};base64,${base64}`);
            } catch (e) {
                console.error("Failed to load local image", src, e);
                setImageSrc(src || "");
            }
        };
        loadImage();
    }, [src, filePath]);

    return <img src={imageSrc} alt={alt} className="max-w-full h-auto rounded-lg my-4" />;
};

const Preview: React.FC<PreviewProps> = ({ content, filePath }) => {
    return (
        <div className="h-full w-full flex flex-col bg-slate-900 overflow-hidden">
            <div className="bg-slate-800 px-4 py-2 border-b border-slate-700 text-sm font-medium text-slate-300">
                Preview
            </div>
            <div className="flex-1 overflow-auto p-8 prose prose-invert max-w-none">
                <ReactMarkdown
                    remarkPlugins={[remarkGfm]}
                    components={{
                        code({ node, inline, className, children, ...props }: any) {
                            const match = /language-(\w+)/.exec(className || '');
                            const isMermaid = match && match[1] === 'mermaid';

                            if (!inline && isMermaid) {
                                return <MermaidBlock code={String(children).replace(/\n$/, '')} />;
                            }

                            return !inline && match ? (
                                <div className="mockup-code bg-slate-800 p-4 rounded-md my-4">
                                    <code className={className} {...props}>
                                        {children}
                                    </code>
                                </div>
                            ) : (
                                <code className="bg-slate-800 px-1 py-0.5 rounded text-sm" {...props}>
                                    {children}
                                </code>
                            );
                        },
                        img({ node, src, alt, ...props }: any) {
                            return <LocalImage src={src} alt={alt} filePath={filePath} />;
                        }
                    }}
                >
                    {content}
                </ReactMarkdown>
            </div>
        </div>
    );
};

export default Preview;
