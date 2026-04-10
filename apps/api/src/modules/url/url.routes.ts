import { Router } from 'express';
import { UrlController } from '@/modules/url/url.controller';
import { UrlService } from '@/modules/url/url.service';
import { UrlRepository } from '@/modules/url/url.repository';
import { NanoIdStrategy } from '@/core/encoding/nanoid.strategy';
import { cacheService } from '@/core/cache/cache.service';
import { validate } from '@/core/middleware/validate';
import { createUrlLimiter } from '@/core/middleware/rate-limiter';
import { createUrlSchema, updateUrlSchema } from '@/modules/url/url.validation';

const router = Router();

// Dependencies
const urlRepository = new UrlRepository();
const encoder = new NanoIdStrategy();
const urlService = new UrlService(urlRepository, encoder, cacheService);
const urlController = new UrlController(urlService);

router.post('/', createUrlLimiter, validate(createUrlSchema), urlController.create);
router.get('/', urlController.getAll);
router.get('/:id', urlController.getById);
router.patch('/:id', validate(updateUrlSchema), urlController.update);
router.delete('/:id', urlController.delete);

export default router;
