import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { UserRepository } from '@/modules/auth/user.repository';
import { config } from '@/core/config';
import { BadRequestError, ConflictError, UnauthorizedError } from '@/shared/errors/app-error';
import { AuthTokens, JwtPayload, RegisterInput, LoginInput, UserResponse } from '@/modules/auth/auth.types';

const SALT_ROUNDS = 12;

export class AuthService {
    constructor(private userRepository: UserRepository) {}

    async register(input: RegisterInput): Promise<{ user: UserResponse; tokens: AuthTokens }> {
        const existing = await this.userRepository.findByEmail(input.email);
        if (existing) {
            throw new ConflictError('Email is already registered');
        }

        const passwordHash = await bcrypt.hash(input.password, SALT_ROUNDS);
        const user = await this.userRepository.create({
            email: input.email,
            passwordHash,
            name: input.name,
        });

        const tokens = this.generateTokens({ userId: user.id.toString(), email: user.email });
        return { user: this.formatUser(user), tokens };
    }

    async login(input: LoginInput): Promise<{ user: UserResponse; tokens: AuthTokens }> {
        const user = await this.userRepository.findByEmail(input.email);
        if (!user || !user.isActive) {
            throw new UnauthorizedError('Invalid email or password');
        }

        const isValid = await bcrypt.compare(input.password, user.passwordHash);
        if (!isValid) {
            throw new UnauthorizedError('Invalid email or password');
        }

        const tokens = this.generateTokens({ userId: user.id.toString(), email: user.email });
        return { user: this.formatUser(user), tokens };
    }

    async refreshTokens(refreshToken: string): Promise<AuthTokens> {
        try {
            const payload = jwt.verify(refreshToken, config.jwt.refreshSecret) as JwtPayload;
            const user = await this.userRepository.findById(BigInt(payload.userId));
            if (!user || !user.isActive) {
                throw new UnauthorizedError('Invalid refresh token');
            }
            return this.generateTokens({ userId: user.id.toString(), email: user.email });
        } catch {
            throw new UnauthorizedError('Invalid refresh token');
        }
    }

    async getMe(userId: bigint): Promise<UserResponse> {
        const user = await this.userRepository.findById(userId);
        if (!user) {
            throw new UnauthorizedError('User not found');
        }
        return this.formatUser(user);
    }

    private generateTokens(payload: JwtPayload): AuthTokens {
        const accessToken = jwt.sign(payload, config.jwt.accessSecret, {
            expiresIn: config.jwt.accessExpiresIn,
        });
        const refreshToken = jwt.sign(payload, config.jwt.refreshSecret, {
            expiresIn: config.jwt.refreshExpiresIn,
        });
        return { accessToken, refreshToken };
    }

    private formatUser(user: { id: bigint; email: string; name: string | null; createdAt: Date }): UserResponse {
        return {
            id: Number(user.id),
            email: user.email,
            name: user.name,
            createdAt: user.createdAt.toISOString(),
        };
    }
}
