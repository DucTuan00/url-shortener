'use client';

import { useState } from 'react';
import ShortenForm from '@/components/forms/shorten-form';
import UrlResult from '@/components/ui/url-result';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ShortenResponse } from '@/lib/api';
import { History } from 'lucide-react';

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
        <div className="w-full space-y-8">
            <ShortenForm onSuccess={handleSuccess} />

            {recentLinks.length > 0 && (
                <div className="space-y-4">
                    <div className="flex items-center gap-3">
                        <Separator className="flex-1" />
                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                            <History className="h-3.5 w-3.5" />
                            Recent links
                            <Badge variant="secondary" className="h-4 text-[10px]">
                                {recentLinks.length}
                            </Badge>
                        </div>
                        <Separator className="flex-1" />
                    </div>

                    <div className="space-y-3">
                        {recentLinks.map((link) => (
                            <UrlResult
                                key={link.id}
                                id={link.id}
                                shortUrl={link.shortUrl}
                                originalUrl={link.originalUrl}
                            />
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
