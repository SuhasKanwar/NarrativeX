import axios from 'axios';
import { MICROSERVICE_BASE_URL } from './config.ts';

export const microserviceApi = axios.create({
    baseURL: MICROSERVICE_BASE_URL
});