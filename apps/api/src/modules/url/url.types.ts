export interface CreateUrlInput {
    originalUrl: string;
    shortCode: string;
    customAlias?: string;
    expiresAt?: Date;
    userId?: bigint;
}

export interface UrlRecord {
    id: bigint;
    shortCode: string;
    originalUrl: string;
    customAlias: string | null;
    userId: bigint | null;
    clickCount: bigint;
    isActive: boolean;
    expiresAt: Date | null;
    createdAt: Date;
    updatedAt: Date;
}
