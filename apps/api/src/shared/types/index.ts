export interface CreateUrlDto {
    url: string;
    customAlias?: string;
    expiresAt?: string;
}

export interface UrlResponse {
    id: number;
    shortCode: string;
    shortUrl: string;
    originalUrl: string;
    customAlias: string | null;
    clickCount: number;
    isActive: boolean;
    expiresAt: string | null;
    createdAt: string;
}
