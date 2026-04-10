export interface ClickData {
    urlId: bigint;
    ipAddress: string | null;
    userAgent: string | null;
    referer: string | null;
}

export interface ParsedClickData {
    urlId: bigint;
    ipAddress: string | null;
    userAgent: string | null;
    referer: string | null;
    country: string | null;
    city: string | null;
    deviceType: string | null;
    browser: string | null;
    os: string | null;
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
