import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { cn } from "@/lib/utils";

interface MarkdownRendererProps {
    content: string;
    className?: string;
}

export function MarkdownRenderer({ content, className }: MarkdownRendererProps) {
    return (
        <div className={cn("prose prose-sm dark:prose-invert max-w-none break-words", className)}>
            <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={{
                    // Custom component mapping to style markdown elements
                    p: ({ children }) => <p className="mb-2 last:mb-0 leading-relaxed">{children}</p>,
                    ul: ({ children }) => <ul className="list-disc pl-5 mb-2 space-y-1">{children}</ul>,
                    ol: ({ children }) => <ol className="list-decimal pl-5 mb-2 space-y-1">{children}</ol>,
                    li: ({ children }) => <li className="pl-1">{children}</li>,
                    h1: ({ children }) => <h1 className="text-xl font-bold mb-2 mt-4 first:mt-0">{children}</h1>,
                    h2: ({ children }) => <h2 className="text-lg font-bold mb-2 mt-4 first:mt-0">{children}</h2>,
                    h3: ({ children }) => <h3 className="text-base font-bold mb-1 mt-2 first:mt-0">{children}</h3>,
                    code: ({ className, children, ...props }) => {
                        const match = /language-(\w+)/.exec(className || '');
                        const isInline = !match && !String(children).includes('\n');

                        if (isInline) {
                            return (
                                <code className="px-1.5 py-0.5 rounded-md bg-muted font-mono text-sm" {...props}>
                                    {children}
                                </code>
                            );
                        }

                        return (
                            <code className={cn("block w-full p-2 overflow-x-auto rounded-md bg-muted/80 font-mono text-sm my-2", className)} {...props}>
                                {children}
                            </code>
                        );
                    },
                    blockquote: ({ children }) => (
                        <blockquote className="border-l-4 border-primary/30 pl-4 py-1 my-2 italic text-muted-foreground bg-muted/20 rounded-r-sm">
                            {children}
                        </blockquote>
                    ),
                    a: ({ href, children }) => (
                        <a
                            href={href}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-primary hover:underline underline-offset-4"
                        >
                            {children}
                        </a>
                    ),
                    table: ({ children }) => (
                        <div className="my-4 overflow-x-auto rounded-md border border-border">
                            <table className="w-full text-sm">{children}</table>
                        </div>
                    ),
                    thead: ({ children }) => <thead className="bg-muted/50 border-b border-border">{children}</thead>,
                    tbody: ({ children }) => <tbody className="divide-y divide-border/50">{children}</tbody>,
                    tr: ({ children }) => <tr className="hover:bg-muted/30 transition-colors">{children}</tr>,
                    th: ({ children }) => <th className="px-4 py-2 text-left font-medium text-muted-foreground">{children}</th>,
                    td: ({ children }) => <td className="px-4 py-2 align-top">{children}</td>,
                }}
            >
                {content}
            </ReactMarkdown>
        </div>
    );
}

