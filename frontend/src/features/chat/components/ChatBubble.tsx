import { cn } from "@/lib/utils";
import { Message } from "../types";

interface ChatBubbleProps {
    message: Message;
}

export function ChatBubble({ message }: ChatBubbleProps) {
    const isUser = message.variant === 'user';

    return (
        <div className={cn(
            "flex w-full mb-4 animate-in fade-in slide-in-from-bottom-2",
            isUser ? "justify-end" : "justify-start"
        )}>
            <div className={cn(
                "max-w-[80%] px-4 py-3 rounded-2xl shadow-sm text-sm md:text-base",
                isUser
                    ? "bg-primary text-primary-foreground rounded-br-sm"
                    : "bg-muted text-muted-foreground rounded-bl-sm"
            )}>
                {message.content}
            </div>
        </div>
    );
}
