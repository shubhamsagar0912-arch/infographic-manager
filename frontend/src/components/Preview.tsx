import React, { useEffect, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import mermaid from 'mermaid';
import { AppSettings } from './Settings';

interface PreviewProps {
    content: string;
    filePath?: string | null;
    settings: AppSettings;
}

mermaid.initialize({
    startOnLoad: false,
    theme: 'default',
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

    return <img src={imageSrc} alt={alt} className="max-w-full h-auto rounded-lg my-4 shadow-sm" />;
};

const Preview: React.FC<PreviewProps> = ({ content, filePath, settings }) => {
    return (
        <div className="h-full w-full flex flex-col bg-white overflow-hidden">
            <div
                className="flex-1 overflow-auto p-12 prose prose-slate max-w-none prose-headings:font-bold prose-h1:text-3xl prose-h1:text-slate-900 prose-a:text-[#0969da] prose-code:text-[#0969da] prose-code:bg-slate-100 prose-code:px-1 prose-code:rounded prose-pre:bg-slate-50 prose-pre:border prose-pre:border-slate-200 prose-img:rounded-lg prose-img:shadow-sm"
                style={{
                    fontSize: settings.fontSize,
                    fontFamily: settings.fontFamily,
                }}
            >
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
                                <div className="mockup-code bg-slate-50 border border-slate-200 p-4 rounded-md my-4 overflow-x-auto">
                                    <code className={className} {...props}>
                                        {children}
                                    </code>
                                </div>
                            ) : (
                                <code className="bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded text-sm font-mono" {...props}>
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
