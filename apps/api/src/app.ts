import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { config } from '@/core/config';
import { errorHandler } from '@/core/middleware/error-handler';
import urlRoutes from '@/modules/url/url.routes';
import redirectRoutes from '@/modules/redirect/redirect.routes';

const app = express();

// Security middleware
app.use(helmet());
app.use(cors({ origin: config.cors.origin }));

// Body parsing
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check
app.get('/health', (_req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API routes
app.use('/api/urls', urlRoutes);

// Redirect routes (must be last — catches /:shortCode)
app.use('/', redirectRoutes);

// Error handling
app.use(errorHandler);

export default app;
