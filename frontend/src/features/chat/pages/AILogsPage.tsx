import { useEffect, useState } from 'react';
import { AILog } from '../types';
import { getAILogs } from '../api';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { MarkdownRenderer } from "@/components/MarkdownRenderer";

function LogTableRow({ log }: { log: AILog }) {
    const [isOutputExpanded, setIsOutputExpanded] = useState(false);
    const [isContextExpanded, setIsContextExpanded] = useState(false);

    return (
        <>
            <tr className="hover:bg-muted/50 transition-colors group bg-background relative border-b border-border/50">
                <td className="px-4 py-3 whitespace-nowrap text-xs text-muted-foreground align-top">
                    {new Date(log.timestamp).toLocaleString()}
                </td>
                <td className="px-4 py-3 align-top">
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-primary/10 text-primary border border-primary/20 whitespace-nowrap">
                        {log.model_name}
                    </span>
                </td>
                <td className="px-4 py-3 max-w-[250px] align-top" title={log.input_text}>
                    <div className="line-clamp-3 font-mono text-xs break-words">{log.input_text}</div>
                </td>
                <td className="px-4 py-3 max-w-[400px] align-top">
                    <div className="flex items-start gap-2">
                        <div className={`text-xs text-muted-foreground ${isOutputExpanded ? '' : 'line-clamp-2'}`}>
                            {isOutputExpanded ? (
                                <MarkdownRenderer content={log.output_text} />
                            ) : (
                                log.output_text
                            )}
                        </div>
                        {log.output_text.length > 100 && (
                            <button
                                onClick={() => setIsOutputExpanded(!isOutputExpanded)}
                                className="shrink-0 text-muted-foreground hover:text-primary transition-colors mt-0.5"
                                title={isOutputExpanded ? "Collapse" : "Expand"}
                            >
                                {isOutputExpanded ? <ChevronDown className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
                            </button>
                        )}
                    </div>
                </td>
                <td className="px-4 py-3 align-top text-right">
                    <button
                        onClick={() => setIsContextExpanded(!isContextExpanded)}
                        className="inline-flex items-center gap-1 text-xs text-primary hover:underline font-medium"
                    >
                        {isContextExpanded ? "Hide Context" : "View Context"}
                        {isContextExpanded ? <ChevronDown className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
                    </button>
                </td>
            </tr>
            {isContextExpanded && (
                <tr className="bg-muted/30 animate-in fade-in zoom-in-95 duration-200">
                    <td colSpan={5} className="px-4 py-4 border-b border-border">
                        <div className="text-xs font-bold text-muted-foreground uppercase mb-2 tracking-wider pl-1">Context Data</div>
                        <div className="bg-zinc-950 p-4 rounded-md shadow-inner border border-zinc-900 overflow-x-auto">
                            <pre className="text-[10px] font-mono text-zinc-300 leading-relaxed whitespace-pre-wrap">
                                {JSON.stringify(log.context, null, 2)}
                            </pre>
                        </div>
                    </td>
                </tr>
            )}
        </>
    );
}

export default function AILogsPage() {
    const [logs, setLogs] = useState<AILog[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        getAILogs()
            .then(data => {
                setLogs(data);
                setLoading(false);
            })
            .catch(err => {
                console.error(err);
                setLoading(false);
            });
    }, []);

    if (loading) return <div className="p-8 text-center text-muted-foreground">Loading logs...</div>;

    return (
        <div className="container mx-auto p-4 space-y-4 max-w-7xl">
            <h1 className="text-2xl font-bold tracking-tight">AI Interaction Logs</h1>

            <div className="border rounded-md overflow-hidden bg-background shadow-sm">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left border-collapse">
                        <thead className="bg-muted/50 text-xs uppercase text-muted-foreground font-medium border-b border-border">
                            <tr>
                                <th className="px-4 py-3 min-w-[150px]">Timestamp</th>
                                <th className="px-4 py-3 w-[100px]">Model</th>
                                <th className="px-4 py-3 max-w-[250px]">Input</th>
                                <th className="px-4 py-3 max-w-[400px]">Output</th>
                                <th className="px-4 py-3 w-[120px] text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border/0">
                            {logs.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-4 py-12 text-center text-muted-foreground">
                                        No logs found yet. Start chatting!
                                    </td>
                                </tr>
                            ) : (
                                logs.map(log => (
                                    <LogTableRow key={log.id} log={log} />
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
