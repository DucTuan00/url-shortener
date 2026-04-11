const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

// --- Token management ---
let accessToken: string | null = null;

export function setAccessToken(token: string | null) {
    accessToken = token;
    if (token) {
        localStorage.setItem('accessToken', token);
    } else {
        localStorage.removeItem('accessToken');
    }
}

export function getAccessToken(): string | null {
    if (accessToken) return accessToken;
    if (typeof window !== 'undefined') {
        accessToken = localStorage.getItem('accessToken');
    }
    return accessToken;
}

function authHeaders(): Record<string, string> {
    const token = getAccessToken();
    return token ? { Authorization: `Bearer ${token}` } : {};
}

// --- Types ---

export interface ShortenResponse {
    status: string;
    data: {
        id: number;
        shortCode: string;
        shortUrl: string;
        originalUrl: string;
        customAlias: string | null;
        clickCount: number;
        isActive: boolean;
        expiresAt: string | null;
        createdAt: string;
    };
}

export interface ApiError {
    status: string;
    message: string;
    errors?: { field: string; message: string }[];
}

export interface UrlStats {
    totalClicks: number;
    uniqueClicks: number;
    clicksByDate: { date: string; clicks: number }[];
    topCountries: { country: string; clicks: number }[];
    topCities: { city: string; clicks: number }[];
    devices: { deviceType: string; clicks: number }[];
    browsers: { browser: string; clicks: number }[];
    operatingSystems: { os: string; clicks: number }[];
    topReferers: { referer: string; clicks: number }[];
}

export interface StatsResponse {
    status: string;
    data: UrlStats;
}

export interface UserData {
    id: number;
    email: string;
    name: string | null;
    createdAt: string;
}

export interface AuthResponse {
    status: string;
    data: {
        user: UserData;
        accessToken: string;
    };
}

export interface UrlListResponse {
    status: string;
    data: ShortenResponse['data'][];
    meta: {
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    };
}

// --- Auth API ---

export async function registerUser(email: string, password: string, name?: string): Promise<AuthResponse> {
    const body: Record<string, string> = { email, password };
    if (name) body.name = name;

    const res = await fetch(`${API_URL}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(body),
    });

    if (!res.ok) {
        const error: ApiError = await res.json();
        throw new Error(error.message || 'Registration failed');
    }

    return res.json();
}

export async function loginUser(email: string, password: string): Promise<AuthResponse> {
    const res = await fetch(`${API_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email, password }),
    });

    if (!res.ok) {
        const error: ApiError = await res.json();
        throw new Error(error.message || 'Login failed');
    }

    return res.json();
}

export async function refreshToken(): Promise<{ accessToken: string } | null> {
    try {
        const res = await fetch(`${API_URL}/api/auth/refresh`, {
            method: 'POST',
            credentials: 'include',
        });

        if (!res.ok) return null;

        const data = await res.json();
        return { accessToken: data.data.accessToken };
    } catch {
        return null;
    }
}

export async function logoutUser(): Promise<void> {
    await fetch(`${API_URL}/api/auth/logout`, {
        method: 'POST',
        credentials: 'include',
    });
    setAccessToken(null);
}

export async function getMe(): Promise<{ status: string; data: UserData }> {
    const res = await fetch(`${API_URL}/api/auth/me`, {
        headers: { ...authHeaders() },
        credentials: 'include',
    });

    if (!res.ok) {
        throw new Error('Not authenticated');
    }

    return res.json();
}

// --- URL API ---

export async function shortenUrl(
    url: string,
    customAlias?: string,
    expiresAt?: string,
): Promise<ShortenResponse> {
    const body: Record<string, string> = { url };
    if (customAlias) body.customAlias = customAlias;
    if (expiresAt) body.expiresAt = expiresAt;

    const res = await fetch(`${API_URL}/api/urls`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...authHeaders() },
        credentials: 'include',
        body: JSON.stringify(body),
    });

    if (!res.ok) {
        const error: ApiError = await res.json();
        throw new Error(error.message || 'Failed to shorten URL');
    }

    return res.json();
}

export async function getUrlStats(id: number, days: number = 30): Promise<StatsResponse> {
    const res = await fetch(`${API_URL}/api/urls/${id}/stats?days=${days}`, {
        headers: { ...authHeaders() },
        credentials: 'include',
    });

    if (!res.ok) {
        const error: ApiError = await res.json();
        throw new Error(error.message || 'Failed to fetch analytics');
    }

    return res.json();
}

export async function getUrlById(id: number): Promise<ShortenResponse> {
    const res = await fetch(`${API_URL}/api/urls/${id}`, {
        headers: { ...authHeaders() },
        credentials: 'include',
    });

    if (!res.ok) {
        const error: ApiError = await res.json();
        throw new Error(error.message || 'Failed to fetch URL');
    }

    return res.json();
}

export async function getUserUrls(page: number = 1, limit: number = 20): Promise<UrlListResponse> {
    const res = await fetch(`${API_URL}/api/urls?page=${page}&limit=${limit}`, {
        headers: { ...authHeaders() },
        credentials: 'include',
    });

    if (!res.ok) {
        const error: ApiError = await res.json();
        throw new Error(error.message || 'Failed to fetch URLs');
    }

    return res.json();
}

export async function deleteUrl(id: number): Promise<void> {
    const res = await fetch(`${API_URL}/api/urls/${id}`, {
        method: 'DELETE',
        headers: { ...authHeaders() },
        credentials: 'include',
    });

    if (!res.ok) {
        const error: ApiError = await res.json();
        throw new Error(error.message || 'Failed to delete URL');
    }
}
