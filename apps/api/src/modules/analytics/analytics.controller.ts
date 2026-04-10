import { Request, Response, NextFunction } from 'express';
import { AnalyticsService } from '@/modules/analytics/analytics.service';

export class AnalyticsController {
    constructor(private analyticsService: AnalyticsService) { }

    getStats = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const idParam = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
            const daysParam = Array.isArray(req.query.days) ? req.query.days[0] : req.query.days;

            const id = BigInt(idParam);
            const days = parseInt(daysParam as string) || 30;
            const stats = await this.analyticsService.getUrlStats(id, days);
            res.json({ status: 'success', data: stats });
        } catch (error) {
            next(error);
        }
    };
}
