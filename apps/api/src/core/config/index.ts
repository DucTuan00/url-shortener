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
    jwt: {
        accessSecret: process.env.JWT_ACCESS_SECRET || 'access-secret-change-in-production',
        refreshSecret: process.env.JWT_REFRESH_SECRET || 'refresh-secret-change-in-production',
        accessExpiresIn: '15m',
        refreshExpiresIn: '7d',
    },
} as const;
