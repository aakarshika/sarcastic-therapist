export interface Message {
    id: string;
    content: string;
    variant: 'user' | 'assistant';
    timestamp: Date;
}

export interface ThinkingStep {
    step: string;
}
