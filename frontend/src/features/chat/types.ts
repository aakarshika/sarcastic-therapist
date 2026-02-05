export interface Message {
    id: string;
    content: string;
    variant: 'user' | 'assistant';
    timestamp: Date;
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
