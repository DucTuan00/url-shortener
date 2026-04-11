import { ClickRepository } from '@/modules/analytics/click.repository';
import { UrlRepository } from '@/modules/url/url.repository';
import { ForbiddenError, NotFoundError } from '@/shared/errors/app-error';
import { UrlStats } from '@/modules/analytics/analytics.types';

export class AnalyticsService {
    constructor(
        private clickRepository: ClickRepository,
        private urlRepository: UrlRepository,
    ) { }

    async getUrlStats(urlId: bigint, userId: bigint, days: number = 30): Promise<UrlStats> {
        const url = await this.urlRepository.findById(urlId);
        if (!url) {
            throw new NotFoundError('URL not found');
        }
        if (url.userId !== userId) {
            throw new ForbiddenError('You do not own this URL');
        }

        const [
            totalClicks,
            uniqueClicks,
            clicksByDate,
            topCountries,
            topCities,
            devices,
            browsers,
            operatingSystems,
            topReferers,
        ] = await Promise.all([
            this.clickRepository.getTotalClicks(urlId),
            this.clickRepository.getUniqueClicks(urlId),
            this.clickRepository.getClicksByDate(urlId, days),
            this.clickRepository.getTopCountries(urlId),
            this.clickRepository.getTopCities(urlId),
            this.clickRepository.getDeviceBreakdown(urlId),
            this.clickRepository.getBrowserBreakdown(urlId),
            this.clickRepository.getOsBreakdown(urlId),
            this.clickRepository.getTopReferers(urlId),
        ]);

        return {
            totalClicks,
            uniqueClicks,
            clicksByDate,
            topCountries,
            topCities,
            devices,
            browsers,
            operatingSystems,
            topReferers,
        };
    }
}
