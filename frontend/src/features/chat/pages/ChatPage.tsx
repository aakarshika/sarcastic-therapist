import { useState, useEffect, useRef } from 'react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ChatBubble } from '../components/ChatBubble';
import { ConversationList } from '../components/ConversationList';
import { Message, Conversation } from '../types';
import { getConversations, getMessages, deleteConversation, createOrGetNewConversation } from '../api';
import { Send, Loader2 } from 'lucide-react';

export default function ChatPage() {
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState('');
    const [thinkingStep, setThinkingStep] = useState<string | null>(null);
    const [isConnected, setIsConnected] = useState(false);

    // Conversation State
    const [conversations, setConversations] = useState<Conversation[]>([]);
    const [activeConversationId, setActiveConversationId] = useState<string | null>(null);

    const socketRef = useRef<WebSocket | null>(null);
    const scrollRef = useRef<HTMLDivElement>(null);

    // Initial load
    useEffect(() => {
        loadConversations();
    }, []);

    const loadConversations = async () => {
        try {
            const data = await getConversations();
            setConversations(data);
        } catch (error) {
            console.error("Failed to load conversations", error);
        }
    };

    const loadMessages = async (id: string) => {
        try {
            const msgs = await getMessages(id);
            // Map backend messages to frontend format if needed
            // Backend sends: { id, role, content, created_at }
            // Frontend expects: { id, content, variant: 'user'|'assistant', timestamp }
            setMessages(msgs.map(m => ({
                id: m.id || Date.now().toString(),
                content: m.content,
                variant: m.role || (m.variant as any), // Handle both if type confusion
                timestamp: m.created_at ? new Date(m.created_at) : new Date()
            })));
        } catch (error) {
            console.error("Failed to load messages", error);
        }
    };

    // WebSocket Connection Management
    useEffect(() => {
        // Connect to WebSocket with current activeConversationId
        const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
        const token = localStorage.getItem('access');
        let wsUrl = `${protocol}//${window.location.hostname}:8282/ws/chat/?token=${token}`;

        if (activeConversationId) {
            wsUrl += `&conversation_id=${activeConversationId}`;
        }

        try {
            console.log(`Connecting to WS: ${wsUrl}`);
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

                    // If backend sends conversation_id, update local state
                    if (data.conversation_id && !activeConversationId) {
                        setActiveConversationId(data.conversation_id);
                        loadConversations(); // Reload list to show new chat title
                    }
                } else if (data.type === 'conversation_started') {
                    if (data.conversation_id && !activeConversationId) {
                        setActiveConversationId(data.conversation_id);
                        loadConversations();
                    }
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
    }, [activeConversationId]); // Reconnect when switching conversations

    // When active ID changes, load messages (if existing)
    useEffect(() => {
        if (activeConversationId) {
            loadMessages(activeConversationId);
        } else {
            setMessages([]);
            setThinkingStep(null);
        }
    }, [activeConversationId]);

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

    const handleDeleteConversation = async (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        if (confirm('Delete this conversation details?')) {
            await deleteConversation(id);
            if (activeConversationId === id) {
                setActiveConversationId(null);
            }
            loadConversations();
        }
    };

    const handleNewChat = async () => {
        try {
            const newConv = await createOrGetNewConversation();
            setConversations(prev => {
                const filtered = prev.filter(c => c.id !== newConv.id);
                return [newConv, ...filtered];
            });
            setActiveConversationId(newConv.id);
        } catch (error) {
            console.error("Failed to start new conversation", error);
        }
    };

    return (
        <div className="flex h-[calc(100vh-4rem)] overflow-hidden">
            {/* Sidebar */}
            <ConversationList
                conversations={conversations}
                activeId={activeConversationId}
                onSelect={(id) => setActiveConversationId(id)}
                onDelete={handleDeleteConversation}
                onNewChat={handleNewChat}
            />

            {/* Main Chat Area */}
            <div className="relative flex flex-1 flex-col items-center bg-background/20 backdrop-blur-sm">

                {/* Header/Status Indicator */}
                <div className="absolute top-4 z-10 flex items-center gap-2 rounded-full border border-white/10 bg-background/30 px-4 py-1.5 text-xs font-medium backdrop-blur-md">
                    <div className={`h-2 w-2 rounded-full ${isConnected ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]' : 'bg-rose-500'}`} />
                    <span className="text-muted-foreground">{isConnected ? 'System Online' : 'Connecting...'}</span>
                </div>

                {/* Chat Container */}
                <div className="flex-1 w-full max-w-4xl p-4 overflow-hidden relative flex flex-col">
                    <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-8 space-y-6 scroll-smooth scrollbar-thin scrollbar-thumb-primary/10 scrollbar-track-transparent">
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
                <div className="w-full max-w-3xl px-4 pb-6 pt-2 z-10">
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
        </div>
    );
}
