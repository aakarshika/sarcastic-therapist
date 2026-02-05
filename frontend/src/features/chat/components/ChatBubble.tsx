import { cn } from "@/lib/utils";
import { Message } from "../types";
import { MarkdownRenderer } from "@/components/MarkdownRenderer";

interface ChatBubbleProps {
    message: Message;
}

export function ChatBubble({ message }: ChatBubbleProps) {
    const isUser = message.variant === 'user';

    return (
        <div className={cn(
            "flex w-full mb-4 animate-in fade-in slide-in-from-bottom-2 duration-300",
            isUser ? "justify-end" : "justify-start"
        )}>
            <div className={cn(
                "max-w-[85%] px-5 py-3.5 rounded-2xl shadow-sm text-sm md:text-base transition-all hover:scale-[1.01]",
                isUser
                    ? "bg-gradient-to-br from-primary to-primary/90 text-primary-foreground rounded-br-sm shadow-primary/20"
                    : "bg-background/60 border border-white/10 backdrop-blur-md text-foreground rounded-bl-sm shadow-lg"
            )}>
                <MarkdownRenderer content={message.content} />
            </div>
        </div>
    );
}
