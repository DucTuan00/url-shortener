import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { config } from '@/core/config';
import { errorHandler } from '@/core/middleware/error-handler';
import { apiLimiter } from '@/core/middleware/rate-limiter';
import urlRoutes from '@/modules/url/url.routes';
import redirectRoutes from '@/modules/redirect/redirect.routes';
import analyticsRoutes from '@/modules/analytics/analytics.routes';
import { startClickTrackingWorker } from '@/core/queue/click-tracking.worker';

const app = express();

// Security middleware
app.use(helmet());
app.use(cors({ origin: config.cors.origin }));

// Body parsing
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rate limiting
app.use('/api/', apiLimiter);

// Health check
app.get('/health', (_req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API routes
app.use('/api/urls', urlRoutes);
app.use('/api/urls', analyticsRoutes);

// Redirect routes (must be last — catches /:shortCode)
app.use('/', redirectRoutes);

// Error handling
app.use(errorHandler);

// Start background workers
startClickTrackingWorker();

export default app;
