export interface Message {
    id: string;
    content: string;
    variant: 'user' | 'assistant';
    timestamp: Date;
    role?: 'user' | 'assistant'; // Backend uses role
    created_at?: string; // Backend uses created_at
}

export interface Conversation {
    id: string;
    title: string;
    updated_at: string;
    preview: string;
}

export interface AILog {
    id: number;
    input_text: string;
    context: any[];  // JSONField
    output_text: string;
    model_name: string;
    timestamp: string;
    tokens_used?: number;
}

export interface ThinkingStep {
    step: string;
}
