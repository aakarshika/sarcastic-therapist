import { useState, useEffect, useRef } from 'react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ChatBubble } from '../components/ChatBubble';
import { Message } from '../types';
import { Send, Loader2, Sparkles } from 'lucide-react';

export default function ChatPage() {
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState('');
    const [thinkingStep, setThinkingStep] = useState<string | null>(null);
    const [isConnected, setIsConnected] = useState(false);
    const socketRef = useRef<WebSocket | null>(null);
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        // Connect to WebSocket
        const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
        const wsUrl = `${protocol}//${window.location.hostname}:8282/ws/chat/`;

        try {
            const socket = new WebSocket(wsUrl);
            socketRef.current = socket;

            socket.onopen = () => {
                console.log('Connected to Chat WS');
                setIsConnected(true);
            };

            socket.onmessage = (event) => {
                const data = JSON.parse(event.data);

                if (data.type === 'thinking') {
                    setThinkingStep(data.step);
                } else if (data.type === 'message') {
                    setThinkingStep(null);
                    setMessages(prev => [...prev, {
                        id: Date.now().toString(),
                        content: data.content,
                        variant: 'assistant',
                        timestamp: new Date()
                    }]);
                }
            };

            socket.onclose = () => {
                console.log('Disconnected from Chat WS');
                setIsConnected(false);
            };

            return () => {
                socket.close();
            };
        } catch (err) {
            console.error("WebSocket connection failed", err);
        }
    }, []);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages, thinkingStep]);

    const handleSend = (e?: React.FormEvent) => {
        e?.preventDefault();
        if (!input.trim() || !socketRef.current || socketRef.current.readyState !== WebSocket.OPEN) return;

        const newMessage: Message = {
            id: Date.now().toString(),
            content: input,
            variant: 'user',
            timestamp: new Date()
        };

        setMessages(prev => [...prev, newMessage]);
        socketRef.current.send(JSON.stringify({ message: input }));
        setInput('');
    };

    return (
        <div className="relative flex h-[calc(100vh-4rem)] flex-col items-center">
            {/* Header/Status Indicator - Floating or consistent */}
            <div className="absolute top-4 z-10 flex items-center gap-2 rounded-full border border-white/10 bg-background/30 px-4 py-1.5 text-xs font-medium backdrop-blur-md">
                <div className={`h-2 w-2 rounded-full ${isConnected ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]' : 'bg-rose-500'}`} />
                <span className="text-muted-foreground">{isConnected ? 'System Online' : 'Connecting...'}</span>
            </div>

            {/* Chat Container */}
            <div className="flex-1 w-full max-w-4xl p-4 overflow-hidden relative">
                <div ref={scrollRef} className="h-full overflow-y-auto px-4 py-8 space-y-6 scroll-smooth scrollbar-thin scrollbar-thumb-primary/10 scrollbar-track-transparent">
                    {messages.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center text-center space-y-6">
                            <div className="relative">
                                <div className="absolute -inset-4 rounded-full bg-primary/20 blur-xl animate-pulse" />
                                <div className="relative bg-background/50 p-4 rounded-2xl border border-white/10 backdrop-blur-sm">
                                    <span className="text-6xl">😏</span>
                                </div>
                            </div>
                            <div className="space-y-2 max-w-md">
                                <h2 className="text-2xl font-bold tracking-tight">Sarcastic Therapist</h2>
                                <p className="text-muted-foreground">
                                    I'm here to listen, judge, and generally be unhelpful. Lie down on the digital couch.
                                </p>
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-6 pb-20">
                            {messages.map((msg) => (
                                <ChatBubble key={msg.id} message={msg} />
                            ))}
                        </div>
                    )}

                    {thinkingStep && (
                        <div className="flex items-center gap-3 text-sm text-primary/80 bg-primary/5 px-4 py-2 rounded-full w-fit border border-primary/10 animate-in fade-in slide-in-from-bottom-2">
                            <Loader2 className="w-4 h-4 animate-spin" />
                            <span className="font-medium">{thinkingStep}</span>
                        </div>
                    )}
                </div>
            </div>

            {/* Input Area */}
            <div className="w-full max-w-3xl px-4 pb-6 pt-2">
                <Card className="border border-white/10 bg-background/60 backdrop-blur-xl shadow-2xl relative overflow-hidden group focus-within:ring-2 focus-within:ring-primary/20 transition-all">
                    <form onSubmit={handleSend} className="flex w-full items-center p-2 gap-2">
                        <Input
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            placeholder="Tell me your latest 'issue'..."
                            disabled={!!thinkingStep || !isConnected}
                            className="flex-1 bg-transparent border-none shadow-none focus-visible:ring-0 text-base h-12 placeholder:text-muted-foreground/50"
                        />
                        <Button
                            type="submit"
                            size="icon"
                            disabled={!!thinkingStep || !isConnected || !input.trim()}
                            className="h-10 w-10 shrink-0 bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg transition-all rounded-full"
                        >
                            {thinkingStep ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                            <span className="sr-only">Send</span>
                        </Button>
                    </form>
                </Card>
            </div>
        </div>
    );
}
