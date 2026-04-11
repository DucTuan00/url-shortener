import prisma from '@/core/database/prisma';
import { CreateUrlInput } from '@/modules/url/url.types';

export class UrlRepository {
    async create(data: CreateUrlInput) {
        return prisma.url.create({
            data: {
                shortCode: data.shortCode,
                originalUrl: data.originalUrl,
                customAlias: data.customAlias || null,
                expiresAt: data.expiresAt || null,
                userId: data.userId || null,
            },
        });
    }

    async findByShortCode(shortCode: string) {
        return prisma.url.findUnique({
            where: { shortCode },
        });
    }

    async findByCustomAlias(alias: string) {
        return prisma.url.findUnique({
            where: { customAlias: alias },
        });
    }

    async findById(id: bigint) {
        return prisma.url.findUnique({
            where: { id },
        });
    }

    async findAll(page: number = 1, limit: number = 20, userId?: bigint) {
        const skip = (page - 1) * limit;
        const where = userId ? { userId } : {};
        const [urls, total] = await Promise.all([
            prisma.url.findMany({
                where,
                skip,
                take: limit,
                orderBy: { createdAt: 'desc' },
            }),
            prisma.url.count({ where }),
        ]);
        return { urls, total, page, limit };
    }

    async update(id: bigint, data: { customAlias?: string; expiresAt?: Date; isActive?: boolean }) {
        return prisma.url.update({
            where: { id },
            data,
        });
    }

    async delete(id: bigint) {
        return prisma.url.delete({
            where: { id },
        });
    }

    async incrementClickCount(shortCode: string) {
        return prisma.url.updateMany({
            where: {
                OR: [{ shortCode }, { customAlias: shortCode }],
            },
            data: { clickCount: { increment: 1 } },
        });
    }

    async existsByShortCode(shortCode: string): Promise<boolean> {
        const count = await prisma.url.count({
            where: { shortCode },
        });
        return count > 0;
    }
}
