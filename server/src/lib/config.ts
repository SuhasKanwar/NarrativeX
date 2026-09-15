import 'dotenv/config';

export const PORT: number = Number(process.env.PORT) || 9000;
export const DATABASE_URL: string = process.env.DATABASE_URL || "postgresql://postgres:postgres@localhost:5432/postgres";
export const MICROSERVICE_BASE_URL: string = process.env.MICROSERVICE_BASE_URL || "http://localhost:8000";
export const JWT_SECRET: string = process.env.JWT_SECRET || "secret";

export const LOGS_DIRECTORY: string = "logs";