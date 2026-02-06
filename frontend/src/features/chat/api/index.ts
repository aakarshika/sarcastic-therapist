import client from '@/api/client';
import { AILog, Conversation, Message } from '../types';

export const getAILogs = async (): Promise<AILog[]> => {
    const response = await client.get('/chat/logs/');
    if (response.data && response.data.data && Array.isArray(response.data.data)) {
        return response.data.data;
    }
    return Array.isArray(response.data) ? response.data : [];
};

export const getConversations = async (): Promise<Conversation[]> => {
    const response = await client.get('/chat/conversations/');
    const data = response.data;

    // Handle unified envelope format
    if (data && data.data && Array.isArray(data.data)) {
        return data.data.map((conv: any) => ({
            id: conv.id.toString(),
            title: conv.title,
            updated_at: conv.updated_at,
            preview: conv.last_message?.content || 'Empty conversation'
        }));
    }

    // Handle legacy/direct array format
    if (Array.isArray(data)) {
        return data.map((conv: any) => ({
            id: conv.id.toString(),
            title: conv.title,
            updated_at: conv.updated_at,
            preview: conv.last_message?.content || 'Empty conversation'
        }));
    }

    return [];
};

export const getMessages = async (id: string): Promise<Message[]> => {
    const response = await client.get(`/chat/conversations/${id}/messages/`);
    if (response.data && response.data.data && Array.isArray(response.data.data)) {
        return response.data.data;
    }
    return Array.isArray(response.data) ? response.data : [];
};

export const createOrGetNewConversation = async (): Promise<Conversation> => {
    const response = await client.post('/chat/conversations/new/');
    const data = response.data;

    // Assuming backend returns UnifiedResponse with data containing the conversation
    const conv = data.data;

    return {
        id: conv.id.toString(),
        title: conv.title,
        updated_at: conv.updated_at,
        preview: conv.last_message?.content || 'Empty conversation'
    };
};

export const deleteConversation = async (id: string): Promise<void> => {
    await client.delete(`/chat/conversations/${id}/`);
};
