import redis from '@/core/cache/redis';

const URL_CACHE_PREFIX = 'url:';
const DEFAULT_TTL = 60 * 60 * 24; // 24 hours

interface CachedUrl {
    originalUrl: string;
    isActive: boolean;
    expiresAt: string | null;
    urlId?: string;
}

export class CacheService {
    async getUrl(shortCode: string): Promise<CachedUrl | null> {
        const data = await redis.get(`${URL_CACHE_PREFIX}${shortCode}`);
        if (!data) return null;
        return JSON.parse(data);
    }

    async setUrl(shortCode: string, data: CachedUrl, ttlSeconds?: number): Promise<void> {
        const ttl = ttlSeconds ?? DEFAULT_TTL;
        await redis.set(
            `${URL_CACHE_PREFIX}${shortCode}`,
            JSON.stringify(data),
            'EX',
            ttl,
        );
    }

    async deleteUrl(shortCode: string): Promise<void> {
        await redis.del(`${URL_CACHE_PREFIX}${shortCode}`);
    }

    async deleteUrls(shortCodes: string[]): Promise<void> {
        if (shortCodes.length === 0) return;
        const keys = shortCodes.map((code) => `${URL_CACHE_PREFIX}${code}`);
        await redis.del(...keys);
    }
}

export const cacheService = new CacheService();
