'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { getUrlStats, getUrlById, UrlStats, ShortenResponse } from '@/lib/api';
import { useAuth } from '@/components/auth-provider';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { ThemeToggle } from '@/components/layout/theme-toggle';
import {
    Link2,
    ArrowLeft,
    MousePointerClick,
    Users,
    Globe,
    Monitor,
    Smartphone,
    Tablet,
    Loader2,
    AlertCircle,
    ExternalLink,
} from 'lucide-react';
import Link from 'next/link';
import ClicksChart from '@/components/analytics/clicks-chart';
import StatsBreakdown from '@/components/analytics/stats-breakdown';

type UrlData = ShortenResponse['data'];

export default function AnalyticsPage() {
    const params = useParams();
    const router = useRouter();
    const { user, loading: authLoading } = useAuth();
    const id = Number(params.id);
    const [stats, setStats] = useState<UrlStats | null>(null);
    const [urlData, setUrlData] = useState<UrlData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [days, setDays] = useState(30);

    useEffect(() => {
        if (!authLoading && !user) {
            router.replace('/login');
        }
    }, [authLoading, user, router]);

    useEffect(() => {
        if (authLoading || !user || !id) {
            return;
        }

        async function load() {
            setLoading(true);
            setError('');
            try {
                const [statsRes, urlRes] = await Promise.all([
                    getUrlStats(id, days),
                    getUrlById(id),
                ]);
                setStats(statsRes.data);
                setUrlData(urlRes.data);
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Failed to load analytics');
            } finally {
                setLoading(false);
            }
        }

        load();
    }, [authLoading, days, id, user]);

    if (authLoading || !user) {
        return (
            <div className="flex min-h-screen items-center justify-center">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
        );
    }

    return (
        <div className="relative flex min-h-screen flex-col">
            {/* Header */}
            <header className="sticky top-0 z-50 w-full border-b border-border/60 bg-background/95 backdrop-blur-lg supports-[backdrop-filter]:bg-background/60">
                <div className="mx-auto flex h-14 max-w-screen-2xl items-center px-4 sm:px-8">
                    <Link href="/" className="flex items-center gap-2 mr-6">
                        <div className="flex h-6 w-6 items-center justify-center rounded-md bg-foreground">
                            <Link2 className="h-3.5 w-3.5 text-background" />
                        </div>
                        <span className="font-semibold tracking-tight">Shrtly</span>
                    </Link>
                    <div className="ml-auto flex items-center gap-1">
                        <ThemeToggle />
                    </div>
                </div>
            </header>

            <main className="flex-1">
                <div className="mx-auto max-w-screen-xl px-4 py-8 sm:px-8">
                    {/* Back button */}
                    <Link
                        href="/dashboard"
                        className="mb-6 inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        Back to dashboard
                    </Link>

                    {loading && (
                        <div className="flex items-center justify-center py-20">
                            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                        </div>
                    )}

                    {error && (
                        <Card className="border-destructive/50 bg-destructive/5">
                            <CardContent className="flex items-center gap-3 p-4">
                                <AlertCircle className="h-5 w-5 text-destructive" />
                                <p className="text-sm text-destructive">{error}</p>
                            </CardContent>
                        </Card>
                    )}

                    {!loading && !error && stats && urlData && (
                        <div className="space-y-6">
                            {/* URL Info Header */}
                            <div className="space-y-2">
                                <div className="flex items-center gap-2">
                                    <h1 className="text-2xl font-bold tracking-tight">Analytics</h1>
                                    <Badge variant="secondary" className="text-xs">
                                        {urlData.isActive ? 'Active' : 'Inactive'}
                                    </Badge>
                                </div>
                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                    <a
                                        href={urlData.shortUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="font-medium text-foreground hover:underline"
                                    >
                                        {urlData.shortUrl}
                                    </a>
                                    <ExternalLink className="h-3.5 w-3.5" />
                                    <span>→</span>
                                    <span className="truncate max-w-md">{urlData.originalUrl}</span>
                                </div>
                            </div>

                            <Separator />

                            {/* Period selector */}
                            <div className="flex items-center gap-2">
                                <span className="text-sm text-muted-foreground">Period:</span>
                                {[7, 14, 30, 90].map((d) => (
                                    <Button
                                        key={d}
                                        variant={days === d ? 'default' : 'outline'}
                                        size="sm"
                                        onClick={() => setDays(d)}
                                        className="h-8 text-xs"
                                    >
                                        {d}d
                                    </Button>
                                ))}
                            </div>

                            {/* Overview Cards */}
                            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                                <Card>
                                    <CardContent className="p-4">
                                        <div className="flex items-center gap-2 text-muted-foreground">
                                            <MousePointerClick className="h-4 w-4" />
                                            <span className="text-xs font-medium">Total Clicks</span>
                                        </div>
                                        <p className="mt-2 text-2xl font-bold">
                                            {stats.totalClicks.toLocaleString()}
                                        </p>
                                    </CardContent>
                                </Card>
                                <Card>
                                    <CardContent className="p-4">
                                        <div className="flex items-center gap-2 text-muted-foreground">
                                            <Users className="h-4 w-4" />
                                            <span className="text-xs font-medium">Unique Clicks</span>
                                        </div>
                                        <p className="mt-2 text-2xl font-bold">
                                            {stats.uniqueClicks.toLocaleString()}
                                        </p>
                                    </CardContent>
                                </Card>
                                <Card>
                                    <CardContent className="p-4">
                                        <div className="flex items-center gap-2 text-muted-foreground">
                                            <Globe className="h-4 w-4" />
                                            <span className="text-xs font-medium">Countries</span>
                                        </div>
                                        <p className="mt-2 text-2xl font-bold">
                                            {stats.topCountries.length}
                                        </p>
                                    </CardContent>
                                </Card>
                                <Card>
                                    <CardContent className="p-4">
                                        <div className="flex items-center gap-2 text-muted-foreground">
                                            <Monitor className="h-4 w-4" />
                                            <span className="text-xs font-medium">Devices</span>
                                        </div>
                                        <p className="mt-2 text-2xl font-bold">
                                            {stats.devices.length}
                                        </p>
                                    </CardContent>
                                </Card>
                            </div>

                            {/* Clicks over time chart */}
                            <Card>
                                <CardContent className="p-4 sm:p-6">
                                    <h2 className="mb-4 text-sm font-medium">Clicks over time</h2>
                                    <ClicksChart data={stats.clicksByDate} />
                                </CardContent>
                            </Card>

                            {/* Breakdown grids */}
                            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                <StatsBreakdown
                                    title="Top Countries"
                                    icon={<Globe className="h-4 w-4" />}
                                    data={stats.topCountries.map((c) => ({
                                        label: c.country,
                                        value: c.clicks,
                                    }))}
                                />
                                <StatsBreakdown
                                    title="Top Cities"
                                    icon={<Globe className="h-4 w-4" />}
                                    data={stats.topCities.map((c) => ({
                                        label: c.city,
                                        value: c.clicks,
                                    }))}
                                />
                                <StatsBreakdown
                                    title="Devices"
                                    icon={<Smartphone className="h-4 w-4" />}
                                    data={stats.devices.map((d) => ({
                                        label: d.deviceType,
                                        value: d.clicks,
                                    }))}
                                />
                                <StatsBreakdown
                                    title="Browsers"
                                    icon={<Monitor className="h-4 w-4" />}
                                    data={stats.browsers.map((b) => ({
                                        label: b.browser,
                                        value: b.clicks,
                                    }))}
                                />
                                <StatsBreakdown
                                    title="Operating Systems"
                                    icon={<Tablet className="h-4 w-4" />}
                                    data={stats.operatingSystems.map((o) => ({
                                        label: o.os,
                                        value: o.clicks,
                                    }))}
                                />
                                <StatsBreakdown
                                    title="Top Referers"
                                    icon={<ExternalLink className="h-4 w-4" />}
                                    data={stats.topReferers.map((r) => ({
                                        label: r.referer,
                                        value: r.clicks,
                                    }))}
                                />
                            </div>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}
