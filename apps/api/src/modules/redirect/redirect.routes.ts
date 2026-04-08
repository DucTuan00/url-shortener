import { Router } from 'express';
import { RedirectController } from '@/modules/redirect/redirect.controller';
import { RedirectService } from '@/modules/redirect/redirect.service';
import { UrlRepository } from '@/modules/url/url.repository';

const router = Router();

const urlRepository = new UrlRepository();
const redirectService = new RedirectService(urlRepository);
const redirectController = new RedirectController(redirectService);

// GET /:shortCode — redirect to original URL
router.get('/:shortCode', redirectController.redirect);

export default router;
