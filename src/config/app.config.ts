import dotenv from 'dotenv';
dotenv.config();

interface DBConfig {
    HOST: string;
    PORT: number;
    USER: string;
    PASSWORD: string;
    DATABASE: string;
}

interface EnvConfigType {
    PORT: number;
    NODE_ENV: string;
    DB: DBConfig;
    JWT_SECRET: string;
    JWT_EXPIRES_IN: string;
}

export const EnvConfig: EnvConfigType = {
    PORT: process.env.PORT ? Number(process.env.PORT) : 3000,
    NODE_ENV: process.env.NODE_ENV || 'development',
    DB: {
        HOST: process.env.DB_HOST || 'localhost',
        PORT: process.env.DB_PORT ? Number(process.env.DB_PORT) : 1433,
        USER: process.env.DB_USER || 'lumen_user',
        PASSWORD: process.env.DB_PASSWORD || 'Lumen2025',
        DATABASE: process.env.DB_NAME || 'LumenLib'
    },
    JWT_SECRET: process.env.JWT_SECRET || 'SuperSecretoLumenLib123',
    JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '3600s'
};
