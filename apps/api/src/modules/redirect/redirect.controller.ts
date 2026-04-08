import { Request, Response, NextFunction } from 'express';
import { RedirectService } from '@/modules/redirect/redirect.service';

export class RedirectController {
    constructor(private redirectService: RedirectService) { }

    redirect = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const shortCode = req.params.shortCode as string;
            const originalUrl = await this.redirectService.resolve(shortCode);

            // 302 Found — allows analytics tracking on every visit
            res.redirect(302, originalUrl);
        } catch (error) {
            next(error);
        }
    };
}
