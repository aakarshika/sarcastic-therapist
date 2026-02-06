import { Conversation } from '../types';
import { Button } from '@/components/ui/button';
import { PlusCircle, MessageSquare, Trash2 } from 'lucide-react';

interface ConversationListProps {
    conversations: Conversation[];
    activeId: string | null;
    onSelect: (id: string) => void;
    onDelete: (id: string, e: React.MouseEvent) => void;
    onNewChat: () => void;
}

export function ConversationList({
    conversations,
    activeId,
    onSelect,
    onDelete,
    onNewChat
}: ConversationListProps) {
    return (
        <div className="w-64 border-r border-white/10 bg-background/40 backdrop-blur-md flex flex-col h-full">
            <div className="p-4 border-b border-white/5">
                <Button
                    onClick={onNewChat}
                    className="w-full justify-start gap-2 bg-primary/20 hover:bg-primary/30 text-primary-foreground border border-primary/20"
                    variant="ghost"
                >
                    <PlusCircle className="w-4 h-4" />
                    New Conversation
                </Button>
            </div>

            <div className="flex-1 overflow-y-auto p-2 space-y-1 scrollbar-thin scrollbar-thumb-white/5">
                {conversations.length === 0 && (
                    <div className="text-center p-4 text-muted-foreground text-sm">
                        No history yet. Start judging yourself!
                    </div>
                )}

                {conversations.map((conv) => (
                    <div
                        key={conv.id}
                        className={`
                            group flex items-center gap-3 px-3 py-3 rounded-lg cursor-pointer transition-all border border-transparent
                            ${activeId === conv.id
                                ? 'bg-primary/10 border-primary/10 text-primary-foreground'
                                : 'hover:bg-white/5 text-muted-foreground hover:text-foreground'
                            }
                        `}
                        onClick={() => onSelect(conv.id)}
                    >
                        <MessageSquare className="w-4 h-4 shrink-0 opacity-70" />
                        <div className="flex-1 overflow-hidden">
                            <h3 className="text-sm font-medium truncate">
                                {conv.title || 'New Chat'}
                            </h3>
                            <p className="text-xs truncate opacity-60">
                                {conv.preview || 'Empty conversation'}
                            </p>
                        </div>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6 opacity-0 group-hover:opacity-100 hover:bg-destructive/20 hover:text-destructive shrink-0 transition-opacity"
                            onClick={(e) => onDelete(conv.id, e)}
                        >
                            <Trash2 className="w-3 h-3" />
                        </Button>
                    </div>
                ))}
            </div>
        </div>
    );
}
