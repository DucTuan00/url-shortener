import dotenv from 'dotenv';

dotenv.config();

export const config = {
    env: process.env.NODE_ENV || 'development',
    port: parseInt(process.env.API_PORT || '3001', 10),
    databaseUrl: process.env.DATABASE_URL!,
    redisUrl: process.env.REDIS_URL || 'redis://localhost:6379',
    shortCodeLength: parseInt(process.env.SHORT_CODE_LENGTH || '7', 10),
    baseUrl: process.env.BASE_URL || 'http://localhost:3001',
    cors: {
        origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
    },
} as const;
