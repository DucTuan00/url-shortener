import prisma from '@/core/database/prisma';
import { ParsedClickData } from '@/modules/analytics/analytics.types';

export class ClickRepository {
    async create(data: ParsedClickData) {
        return prisma.click.create({
            data: {
                urlId: data.urlId,
                ipAddress: data.ipAddress,
                userAgent: data.userAgent,
                referer: data.referer,
                country: data.country,
                city: data.city,
                deviceType: data.deviceType,
                browser: data.browser,
                os: data.os,
            },
        });
    }

    async getClicksByUrlId(urlId: bigint, days: number = 30) {
        const since = new Date();
        since.setDate(since.getDate() - days);

        return prisma.click.findMany({
            where: {
                urlId,
                clickedAt: { gte: since },
            },
            orderBy: { clickedAt: 'desc' },
        });
    }

    async getTotalClicks(urlId: bigint): Promise<number> {
        return prisma.click.count({ where: { urlId } });
    }

    async getUniqueClicks(urlId: bigint): Promise<number> {
        const result = await prisma.click.findMany({
            where: { urlId },
            distinct: ['ipAddress'],
            select: { ipAddress: true },
        });
        return result.length;
    }

    async getClicksByDate(urlId: bigint, days: number = 30) {
        const since = new Date();
        since.setDate(since.getDate() - days);

        const clicks = await prisma.$queryRawUnsafe<{ date: string; clicks: bigint }[]>(
            `SELECT DATE(clicked_at) as date, COUNT(*)::bigint as clicks
             FROM clicks
             WHERE url_id = $1 AND clicked_at >= $2
             GROUP BY DATE(clicked_at)
             ORDER BY date ASC`,
            urlId,
            since,
        );

        return clicks.map((row) => ({
            date: String(row.date),
            clicks: Number(row.clicks),
        }));
    }

    async getTopCountries(urlId: bigint, limit: number = 10) {
        const results = await prisma.$queryRawUnsafe<{ country: string; clicks: bigint }[]>(
            `SELECT country, COUNT(*)::bigint as clicks
             FROM clicks
             WHERE url_id = $1 AND country IS NOT NULL
             GROUP BY country
             ORDER BY clicks DESC
             LIMIT $2`,
            urlId,
            limit,
        );
        return results.map((r) => ({ country: r.country, clicks: Number(r.clicks) }));
    }

    async getTopCities(urlId: bigint, limit: number = 10) {
        const results = await prisma.$queryRawUnsafe<{ city: string; clicks: bigint }[]>(
            `SELECT city, COUNT(*)::bigint as clicks
             FROM clicks
             WHERE url_id = $1 AND city IS NOT NULL
             GROUP BY city
             ORDER BY clicks DESC
             LIMIT $2`,
            urlId,
            limit,
        );
        return results.map((r) => ({ city: r.city, clicks: Number(r.clicks) }));
    }

    async getDeviceBreakdown(urlId: bigint) {
        const results = await prisma.$queryRawUnsafe<{ device_type: string; clicks: bigint }[]>(
            `SELECT device_type, COUNT(*)::bigint as clicks
             FROM clicks
             WHERE url_id = $1 AND device_type IS NOT NULL
             GROUP BY device_type
             ORDER BY clicks DESC`,
            urlId,
        );
        return results.map((r) => ({ deviceType: r.device_type, clicks: Number(r.clicks) }));
    }

    async getBrowserBreakdown(urlId: bigint) {
        const results = await prisma.$queryRawUnsafe<{ browser: string; clicks: bigint }[]>(
            `SELECT browser, COUNT(*)::bigint as clicks
             FROM clicks
             WHERE url_id = $1 AND browser IS NOT NULL
             GROUP BY browser
             ORDER BY clicks DESC`,
            urlId,
        );
        return results.map((r) => ({ browser: r.browser, clicks: Number(r.clicks) }));
    }

    async getOsBreakdown(urlId: bigint) {
        const results = await prisma.$queryRawUnsafe<{ os: string; clicks: bigint }[]>(
            `SELECT os, COUNT(*)::bigint as clicks
             FROM clicks
             WHERE url_id = $1 AND os IS NOT NULL
             GROUP BY os
             ORDER BY clicks DESC`,
            urlId,
        );
        return results.map((r) => ({ os: r.os, clicks: Number(r.clicks) }));
    }

    async getTopReferers(urlId: bigint, limit: number = 10) {
        const results = await prisma.$queryRawUnsafe<{ referer: string; clicks: bigint }[]>(
            `SELECT referer, COUNT(*)::bigint as clicks
             FROM clicks
             WHERE url_id = $1 AND referer IS NOT NULL
             GROUP BY referer
             ORDER BY clicks DESC
             LIMIT $2`,
            urlId,
            limit,
        );
        return results.map((r) => ({ referer: r.referer, clicks: Number(r.clicks) }));
    }
}
