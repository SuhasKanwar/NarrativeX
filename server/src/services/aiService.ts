import { microserviceApi } from '../lib/api';

class AiService {
    async post<T = any>(route: string, payload: any): Promise<T> {
        try {
            const response = await microserviceApi.post<T>(route, payload);
            return response.data;
        } catch (error) {
            console.error(`Error in AiService POST to ${route}:`, error);
            throw error;
        }
    }
}

export const aiService = new AiService();