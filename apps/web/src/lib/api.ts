const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

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
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
    });

    if (!res.ok) {
        const error: ApiError = await res.json();
        throw new Error(error.message || 'Failed to shorten URL');
    }

    return res.json();
}

export async function getUrlStats(id: number, days: number = 30): Promise<StatsResponse> {
    const res = await fetch(`${API_URL}/api/urls/${id}/stats?days=${days}`);

    if (!res.ok) {
        const error: ApiError = await res.json();
        throw new Error(error.message || 'Failed to fetch analytics');
    }

    return res.json();
}

export async function getUrlById(id: number): Promise<ShortenResponse> {
    const res = await fetch(`${API_URL}/api/urls/${id}`);

    if (!res.ok) {
        const error: ApiError = await res.json();
        throw new Error(error.message || 'Failed to fetch URL');
    }

    return res.json();
}
