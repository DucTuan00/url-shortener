'use client';

import { useState } from 'react';
import ShortenForm from '@/components/forms/shorten-form';
import UrlResult from '@/components/ui/url-result';
import { ShortenResponse } from '@/lib/api';

interface RecentLink {
    id: number;
    shortUrl: string;
    originalUrl: string;
}

export default function UrlShortenerApp() {
    const [recentLinks, setRecentLinks] = useState<RecentLink[]>([]);

    const handleSuccess = (data: ShortenResponse['data']) => {
        setRecentLinks((prev) => [
            { id: data.id, shortUrl: data.shortUrl, originalUrl: data.originalUrl },
            ...prev,
        ]);
    };

    return (
        <>
            <ShortenForm onSuccess={handleSuccess} />

            {recentLinks.length > 0 && (
                <div className="mt-8 space-y-3">
                    <h2 className="text-left text-sm font-medium text-gray-500 dark:text-gray-400">
                        Recent links
                    </h2>
                    {recentLinks.map((link) => (
                        <UrlResult
                            key={link.id}
                            shortUrl={link.shortUrl}
                            originalUrl={link.originalUrl}
                        />
                    ))}
                </div>
            )}
        </>
    );
}
