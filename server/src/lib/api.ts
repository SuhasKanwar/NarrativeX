import axios from 'axios';
import { MICROSERVICE_BASE_URL } from './config';

export const microserviceApi = axios.create({
    baseURL: MICROSERVICE_BASE_URL
});