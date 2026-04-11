import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '@/core/config';
import { JwtPayload } from '@/modules/auth/auth.types';

declare global {
    namespace Express {
        interface Request {
            userId?: string;
        }
    }
}

export function authenticate(req: Request, res: Response, next: NextFunction) {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
        return res.status(401).json({ status: 'error', message: 'Authentication required' });
    }

    const token = authHeader.split(' ')[1];
    try {
        const payload = jwt.verify(token, config.jwt.accessSecret) as JwtPayload;
        req.userId = payload.userId;
        next();
    } catch {
        return res.status(401).json({ status: 'error', message: 'Invalid or expired token' });
    }
}

export function optionalAuth(req: Request, _res: Response, next: NextFunction) {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
        return next();
    }

    const token = authHeader.split(' ')[1];
    try {
        const payload = jwt.verify(token, config.jwt.accessSecret) as JwtPayload;
        req.userId = payload.userId;
    } catch {
        // Ignore invalid token for optional auth
    }
    next();
}
