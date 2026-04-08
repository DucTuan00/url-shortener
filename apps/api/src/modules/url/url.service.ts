import { UrlRepository } from '@/modules/url/url.repository';
import { IEncodingStrategy } from '@/core/encoding/encoding.interface';
import { config } from '@/core/config';
import { BadRequestError, ConflictError, NotFoundError } from '@/shared/errors/app-error';
import { UrlResponse } from '@/shared/types';

const MAX_COLLISION_RETRIES = 3;

export class UrlService {
    constructor(
        private urlRepository: UrlRepository,
        private encoder: IEncodingStrategy,
    ) { }

    async createShortUrl(dto: { url: string; customAlias?: string; expiresAt?: string }): Promise<UrlResponse> {
        // Handle custom alias
        if (dto.customAlias) {
            const existing = await this.urlRepository.findByCustomAlias(dto.customAlias);
            if (existing) {
                throw new ConflictError(`Alias "${dto.customAlias}" is already taken`);
            }
        }

        // Generate unique short code with collision handling
        let shortCode = '';
        let retries = 0;

        while (retries < MAX_COLLISION_RETRIES) {
            shortCode = this.encoder.encode();
            const exists = await this.urlRepository.existsByShortCode(shortCode);
            if (!exists) break;
            retries++;
        }

        if (retries >= MAX_COLLISION_RETRIES) {
            throw new BadRequestError('Failed to generate unique short code. Please try again.');
        }

        const url = await this.urlRepository.create({
            originalUrl: dto.url,
            shortCode,
            customAlias: dto.customAlias,
            expiresAt: dto.expiresAt ? new Date(dto.expiresAt) : undefined,
        });

        return this.formatUrl(url);
    }

    async getUrlById(id: bigint): Promise<UrlResponse> {
        const url = await this.urlRepository.findById(id);
        if (!url) {
            throw new NotFoundError('URL not found');
        }
        return this.formatUrl(url);
    }

    async getAllUrls(page: number, limit: number) {
        const result = await this.urlRepository.findAll(page, limit);
        return {
            data: result.urls.map((u: any) => this.formatUrl(u)),
            meta: {
                total: result.total,
                page: result.page,
                limit: result.limit,
                totalPages: Math.ceil(result.total / result.limit),
            },
        };
    }

    async updateUrl(id: bigint, data: { customAlias?: string; expiresAt?: string | null; isActive?: boolean }) {
        const url = await this.urlRepository.findById(id);
        if (!url) {
            throw new NotFoundError('URL not found');
        }

        if (data.customAlias && data.customAlias !== url.customAlias) {
            const existing = await this.urlRepository.findByCustomAlias(data.customAlias);
            if (existing) {
                throw new ConflictError(`Alias "${data.customAlias}" is already taken`);
            }
        }

        const updated = await this.urlRepository.update(id, {
            customAlias: data.customAlias,
            expiresAt: data.expiresAt === null ? undefined : data.expiresAt ? new Date(data.expiresAt) : undefined,
            isActive: data.isActive,
        });

        return this.formatUrl(updated);
    }

    async deleteUrl(id: bigint) {
        const url = await this.urlRepository.findById(id);
        if (!url) {
            throw new NotFoundError('URL not found');
        }
        await this.urlRepository.delete(id);
    }

    private formatUrl(url: {
        id: bigint;
        shortCode: string;
        originalUrl: string;
        customAlias: string | null;
        clickCount: bigint;
        isActive: boolean;
        expiresAt: Date | null;
        createdAt: Date;
    }): UrlResponse {
        const slug = url.customAlias || url.shortCode;
        return {
            id: Number(url.id),
            shortCode: url.shortCode,
            shortUrl: `${config.baseUrl}/${slug}`,
            originalUrl: url.originalUrl,
            customAlias: url.customAlias,
            clickCount: Number(url.clickCount),
            isActive: url.isActive,
            expiresAt: url.expiresAt?.toISOString() || null,
            createdAt: url.createdAt.toISOString(),
        };
    }
}
