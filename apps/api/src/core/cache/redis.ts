import Redis from 'ioredis';
import { config } from '@/core/config';

const redis = new Redis(config.redisUrl, {
    maxRetriesPerRequest: 3,
});

redis.on('connect', () => {
    console.log('✅ Redis connected');
});

redis.on('error', (err) => {
    console.error('❌ Redis error:', err.message);
});

export default redis;
