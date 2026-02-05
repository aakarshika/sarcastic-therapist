import client from '@/api/client';
import { AILog } from '../types';

export const getAILogs = async (): Promise<AILog[]> => {
    const response = await client.get('/chat/logs/');
    // Handle wrapped response from StandardPagination
    if (response.data && response.data.data && Array.isArray(response.data.data)) {
        return response.data.data;
    }
    // Fallback for direct array response
    return Array.isArray(response.data) ? response.data : [];
};
