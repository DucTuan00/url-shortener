import { Router } from 'express';
import { AnalyticsController } from '@/modules/analytics/analytics.controller';
import { AnalyticsService } from '@/modules/analytics/analytics.service';
import { ClickRepository } from '@/modules/analytics/click.repository';
import { UrlRepository } from '@/modules/url/url.repository';

const router = Router();

const clickRepository = new ClickRepository();
const urlRepository = new UrlRepository();
const analyticsService = new AnalyticsService(clickRepository, urlRepository);
const analyticsController = new AnalyticsController(analyticsService);

// GET /api/urls/:id/stats — get analytics for a URL
router.get('/:id/stats', analyticsController.getStats);

export default router;
