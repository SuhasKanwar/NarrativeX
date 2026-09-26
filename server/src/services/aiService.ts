import { microserviceApi } from '../lib/api';

class AiService {
    async post<T = any>(route: string, payload: any): Promise<T> {
        try {
            const response = await microserviceApi.post<T>(route, payload);
            return response.data;
        } catch {
            // Axios errors contain the request payload, including the delegated user token.
            throw new Error("The research service could not complete the request. Please try again.");
        }
    }
}

export const aiService = new AiService();
