import { UrlRepository } from '@/modules/url/url.repository';
import { CacheService } from '@/core/cache/cache.service';
import { NotFoundError } from '@/shared/errors/app-error';
import { enqueueClick } from '@/core/queue/click-tracking.queue';
import { ClickData } from '@/modules/analytics/analytics.types';

interface ResolveResult {
    originalUrl: string;
    urlId: bigint;
}

interface UrlRecord {
    id: bigint;
    shortCode: string;
    originalUrl: string;
    customAlias: string | null;
    isActive: boolean;
    expiresAt: Date | null;
}

export class RedirectService {
    constructor(
        private urlRepository: UrlRepository,
        private cacheService: CacheService,
    ) { }

    async resolve(shortCode: string): Promise<ResolveResult> {
        // 1. Check Redis cache first
        const cached = await this.cacheService.getUrl(shortCode);
        if (cached) {
            if (!cached.isActive) {
                throw new NotFoundError('Short URL not found or inactive');
            }
            if (cached.expiresAt && new Date(cached.expiresAt) < new Date()) {
                throw new NotFoundError('This short URL has expired');
            }

            if (cached.urlId) {
                // Increment click count async (fire-and-forget)
                this.urlRepository.incrementClickCount(shortCode).catch((err) => {
                    console.error('Failed to increment click count:', err);
                });
                return { originalUrl: cached.originalUrl, urlId: BigInt(cached.urlId) };
            }
        }

        // 2. Cache miss — query DB
        const url = await this.findUrlRecord(shortCode);

        if (!url || !url.isActive) {
            throw new NotFoundError('Short URL not found or inactive');
        }

        // Check expiration
        if (url.expiresAt && url.expiresAt < new Date()) {
            throw new NotFoundError('This short URL has expired');
        }

        // 3. Populate cache (for both shortCode and customAlias)
        this.cacheResolvedUrl(url).catch((err) => {
            console.error('Failed to cache URL:', err);
        });

        // Increment click count (async, don't block redirect)
        this.urlRepository.incrementClickCount(shortCode).catch((err) => {
            console.error('Failed to increment click count:', err);
        });

        return { originalUrl: url.originalUrl, urlId: url.id };
    }

    async trackClick(clickData: ClickData): Promise<void> {
        enqueueClick(clickData).catch((err) => {
            console.error('Failed to enqueue click tracking:', err);
        });
    }

    private async findUrlRecord(shortCode: string): Promise<UrlRecord | null> {
        let url = await this.urlRepository.findByShortCode(shortCode);

        if (!url) {
            url = await this.urlRepository.findByCustomAlias(shortCode);
        }

        return url;
    }

    private async cacheResolvedUrl(url: UrlRecord): Promise<void> {
        const cacheData = {
            originalUrl: url.originalUrl,
            isActive: url.isActive,
            expiresAt: url.expiresAt?.toISOString() || null,
            urlId: url.id.toString(),
        };

        await this.cacheService.setUrl(url.shortCode, cacheData);

        if (url.customAlias) {
            await this.cacheService.setUrl(url.customAlias, cacheData);
        }
    }
}
