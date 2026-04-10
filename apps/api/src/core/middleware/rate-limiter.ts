import rateLimit from 'express-rate-limit';
import RedisStore from 'rate-limit-redis';
import redis from '@/core/cache/redis';

/**
 * General API rate limiter: 100 requests per 15 minutes per IP
 * Skips routes that have their own dedicated limiter to avoid double-counting.
 */
export const apiLimiter = rateLimit({
    store: new RedisStore({
        // @ts-expect-error - ioredis sendCommand is compatible
        sendCommand: (...args: string[]) => redis.call(...args),
    }),
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100,
    standardHeaders: true,
    legacyHeaders: false,
    // Skip POST /api/urls — it has its own createUrlLimiter
    skip: (req) => req.method === 'POST' && req.originalUrl === '/api/urls',
    message: {
        status: 'error',
        message: 'Too many requests, please try again later.',
    },
});

/**
 * Stricter limiter for URL creation: 20 requests per 15 minutes per IP
 */
export const createUrlLimiter = rateLimit({
    store: new RedisStore({
        // @ts-expect-error - ioredis sendCommand is compatible
        sendCommand: (...args: string[]) => redis.call(...args),
    }),
    windowMs: 15 * 60 * 1000,
    max: 20,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        status: 'error',
        message: 'Too many URLs created, please try again later.',
    },
});
