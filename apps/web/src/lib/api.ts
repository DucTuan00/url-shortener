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
