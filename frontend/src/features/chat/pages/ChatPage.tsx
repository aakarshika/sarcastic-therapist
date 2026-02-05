import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ChatBubble } from '../components/ChatBubble';
import { Message } from '../types';
import { Send, Loader2 } from 'lucide-react';

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
        // Using port 8282 as identified in vite proxy config
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
        <div className="container mx-auto py-8 px-4 h-screen max-h-[900px]">
            <Card className="h-full flex flex-col shadow-lg border-opacity-50">
                <CardHeader className="border-b bg-card/50 backdrop-blur">
                    <CardTitle className="flex items-center gap-2">
                        <span>😏</span>
                        Sarcastic Therapist
                        <div className={`ml-auto w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`} title={isConnected ? "Online" : "Offline"} />
                    </CardTitle>
                </CardHeader>

                <CardContent className="flex-1 overflow-hidden p-0 relative">
                    <div ref={scrollRef} className="h-full overflow-y-auto p-4 space-y-4 scroll-smooth">
                        {messages.length === 0 && (
                            <div className="h-full flex flex-col items-center justify-center text-muted-foreground opacity-50 space-y-2">
                                <p className="text-4xl">🛋️</p>
                                <p>Lie down. Tell me about your "problems".</p>
                            </div>
                        )}

                        {messages.map((msg) => (
                            <ChatBubble key={msg.id} message={msg} />
                        ))}

                        {thinkingStep && (
                            <div className="flex animate-pulse items-center gap-3 text-sm text-muted-foreground bg-muted/30 p-3 rounded-lg w-fit">
                                <Loader2 className="w-4 h-4 animate-spin" />
                                <span>{thinkingStep}</span>
                            </div>
                        )}
                    </div>
                </CardContent>

                <CardFooter className="p-4 border-t bg-card/50 backdrop-blur">
                    <form onSubmit={handleSend} className="flex w-full gap-2">
                        <Input
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            placeholder="Type a message..."
                            disabled={!!thinkingStep || !isConnected}
                            className="flex-1"
                        />
                        <Button type="submit" disabled={!!thinkingStep || !isConnected || !input.trim()}>
                            <Send className="w-4 h-4" />
                            <span className="sr-only">Send</span>
                        </Button>
                    </form>
                </CardFooter>
            </Card>
        </div>
    );
}
