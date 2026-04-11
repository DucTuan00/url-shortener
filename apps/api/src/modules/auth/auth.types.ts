export interface RegisterInput {
    email: string;
    password: string;
    name?: string;
}

export interface LoginInput {
    email: string;
    password: string;
}

export interface AuthTokens {
    accessToken: string;
    refreshToken: string;
}

export interface JwtPayload {
    userId: string;
    email: string;
}

export interface UserResponse {
    id: number;
    email: string;
    name: string | null;
    createdAt: string;
}
