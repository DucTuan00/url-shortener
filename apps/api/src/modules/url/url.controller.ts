import { Request, Response, NextFunction } from 'express';
import { UrlService } from '@/modules/url/url.service';

export class UrlController {
    constructor(private urlService: UrlService) { }

    create = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const userId = req.userId ? BigInt(req.userId) : undefined;
            const result = await this.urlService.createShortUrl(req.body, userId);
            res.status(201).json({ status: 'success', data: result });
        } catch (error) {
            next(error);
        }
    };

    getAll = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const page = parseInt(req.query.page as string) || 1;
            const limit = parseInt(req.query.limit as string) || 20;
            const userId = BigInt(req.userId as string);
            const result = await this.urlService.getAllUrls(page, limit, userId);
            res.json({ status: 'success', ...result });
        } catch (error) {
            next(error);
        }
    };

    getById = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const id = BigInt(req.params.id as string);
            const userId = BigInt(req.userId as string);
            const result = await this.urlService.getUrlById(id, userId);
            res.json({ status: 'success', data: result });
        } catch (error) {
            next(error);
        }
    };

    update = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const id = BigInt(req.params.id as string);
            const userId = BigInt(req.userId as string);
            const result = await this.urlService.updateUrl(id, req.body, userId);
            res.json({ status: 'success', data: result });
        } catch (error) {
            next(error);
        }
    };

    delete = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const id = BigInt(req.params.id as string);
            const userId = BigInt(req.userId as string);
            await this.urlService.deleteUrl(id, userId);
            res.status(204).send();
        } catch (error) {
            next(error);
        }
    };
}
