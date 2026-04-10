import { Request, Response, NextFunction } from 'express';
import { RedirectService } from '@/modules/redirect/redirect.service';

export class RedirectController {
    constructor(private redirectService: RedirectService) { }

    redirect = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const shortCode = req.params.shortCode as string;
            const { originalUrl, urlId } = await this.redirectService.resolve(shortCode);

            // Track click asynchronously (fire-and-forget)
            this.redirectService.trackClick({
                urlId,
                ipAddress: (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() || req.ip || null,
                userAgent: req.headers['user-agent'] || null,
                referer: req.headers['referer'] || null,
            });

            // 302 Found — allows analytics tracking on every visit
            res.redirect(302, originalUrl);
        } catch (error) {
            next(error);
        }
    };
}
