import { UrlRepository } from '@/modules/url/url.repository';
import { NotFoundError } from '@/shared/errors/app-error';

export class RedirectService {
    constructor(private urlRepository: UrlRepository) { }

    async resolve(shortCode: string): Promise<string> {
        // Try finding by short code
        let url = await this.urlRepository.findByShortCode(shortCode);

        // If not found, try by custom alias
        if (!url) {
            url = await this.urlRepository.findByCustomAlias(shortCode);
        }

        if (!url || !url.isActive) {
            throw new NotFoundError('Short URL not found or inactive');
        }

        // Check expiration
        if (url.expiresAt && url.expiresAt < new Date()) {
            throw new NotFoundError('This short URL has expired');
        }

        // Increment click count (async, don't block redirect)
        this.urlRepository.incrementClickCount(url.shortCode).catch((err) => {
            console.error('Failed to increment click count:', err);
        });

        return url.originalUrl;
    }
}
