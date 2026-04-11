import { Request, Response, NextFunction } from 'express';
import { AuthService } from '@/modules/auth/auth.service';
import { config } from '@/core/config';

const REFRESH_TOKEN_COOKIE = 'refreshToken';
const COOKIE_OPTIONS = {
    httpOnly: true,
    secure: config.env === 'production',
    sameSite: 'lax' as const,
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    path: '/',
};

export class AuthController {
    constructor(private authService: AuthService) {}

    register = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { user, tokens } = await this.authService.register(req.body);
            res.cookie(REFRESH_TOKEN_COOKIE, tokens.refreshToken, COOKIE_OPTIONS);
            res.status(201).json({
                status: 'success',
                data: { user, accessToken: tokens.accessToken },
            });
        } catch (error) {
            next(error);
        }
    };

    login = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { user, tokens } = await this.authService.login(req.body);
            res.cookie(REFRESH_TOKEN_COOKIE, tokens.refreshToken, COOKIE_OPTIONS);
            res.json({
                status: 'success',
                data: { user, accessToken: tokens.accessToken },
            });
        } catch (error) {
            next(error);
        }
    };

    refresh = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const refreshToken = req.cookies?.[REFRESH_TOKEN_COOKIE];
            if (!refreshToken) {
                return res.status(401).json({ status: 'error', message: 'No refresh token' });
            }
            const tokens = await this.authService.refreshTokens(refreshToken);
            res.cookie(REFRESH_TOKEN_COOKIE, tokens.refreshToken, COOKIE_OPTIONS);
            res.json({
                status: 'success',
                data: { accessToken: tokens.accessToken },
            });
        } catch (error) {
            next(error);
        }
    };

    logout = async (_req: Request, res: Response) => {
        res.clearCookie(REFRESH_TOKEN_COOKIE, { path: '/' });
        res.json({ status: 'success', message: 'Logged out' });
    };

    me = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const userId = BigInt((req as any).userId);
            const user = await this.authService.getMe(userId);
            res.json({ status: 'success', data: user });
        } catch (error) {
            next(error);
        }
    };
}
