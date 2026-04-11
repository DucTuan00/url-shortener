'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/components/auth-provider';
import { getUserUrls, deleteUrl, ShortenResponse } from '@/lib/api';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { ThemeToggle } from '@/components/layout/theme-toggle';
import { useCopyToClipboard } from '@/hooks/use-copy-clipboard';
import {
    Link2,
    Plus,
    BarChart3,
    Copy,
    Check,
    Trash2,
    ExternalLink,
    Loader2,
    LinkIcon,
    LogOut,
    User,
} from 'lucide-react';

type UrlData = ShortenResponse['data'];

function LinkCard({ url, onDelete }: { url: UrlData; onDelete: (id: number) => void }) {
    const { copied, copy } = useCopyToClipboard();
    const [deleting, setDeleting] = useState(false);

    const handleDelete = async () => {
        if (!confirm('Are you sure you want to delete this link?')) return;
        setDeleting(true);
        try {
            await deleteUrl(url.id);
            onDelete(url.id);
        } catch {
            setDeleting(false);
        }
    };

    return (
        <Card className="overflow-hidden border-border">
            <CardContent className="p-0">
                <div className="flex items-center gap-3 border-b border-border px-4 py-3">
                    <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-muted">
                        <LinkIcon className="h-3.5 w-3.5 text-foreground" />
                    </div>
                    <div className="min-w-0 flex-1">
                        <a
                            href={url.shortUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1.5 text-sm font-medium text-foreground transition-colors hover:underline"
                        >
                            <span className="truncate">{url.shortUrl}</span>
                            <ExternalLink className="h-3 w-3 shrink-0 text-muted-foreground" />
                        </a>
                    </div>
                    <Badge variant={url.isActive ? 'outline' : 'secondary'} className="shrink-0 text-xs">
                        {url.isActive ? 'Active' : 'Inactive'}
                    </Badge>
                </div>

                <div className="flex items-center gap-3 px-4 py-3">
                    <p className="min-w-0 flex-1 truncate text-xs text-muted-foreground">
                        {url.originalUrl}
                    </p>
                    <div className="flex items-center gap-1">
                        <span className="text-xs text-muted-foreground mr-1">
                            {url.clickCount} clicks
                        </span>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button variant="outline" size="sm" className="h-8 gap-1.5" asChild>
                                    <Link href={`/analytics/${url.id}`}>
                                        <BarChart3 className="h-3.5 w-3.5" />
                                        Stats
                                    </Link>
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent side="top">View analytics</TooltipContent>
                        </Tooltip>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => copy(url.shortUrl)}
                                    className="h-8 w-8 p-0"
                                >
                                    {copied ? (
                                        <Check className="h-3.5 w-3.5 text-green-600" />
                                    ) : (
                                        <Copy className="h-3.5 w-3.5" />
                                    )}
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent side="top">{copied ? 'Copied!' : 'Copy link'}</TooltipContent>
                        </Tooltip>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={handleDelete}
                                    disabled={deleting}
                                    className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                                >
                                    <Trash2 className="h-3.5 w-3.5" />
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent side="top">Delete link</TooltipContent>
                        </Tooltip>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}

export default function DashboardPage() {
    const router = useRouter();
    const { user, loading: authLoading, logout } = useAuth();
    const [urls, setUrls] = useState<UrlData[]>([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    useEffect(() => {
        if (!authLoading && !user) {
            router.push('/login');
        }
    }, [authLoading, user, router]);

    useEffect(() => {
        if (!user) return;
        async function load() {
            setLoading(true);
            try {
                const res = await getUserUrls(page);
                setUrls(res.data);
                setTotalPages(res.meta.totalPages);
            } catch {
                // handle silently
            } finally {
                setLoading(false);
            }
        }
        load();
    }, [user, page]);

    const handleDelete = (id: number) => {
        setUrls((prev) => prev.filter((u) => u.id !== id));
    };

    if (authLoading || !user) {
        return (
            <div className="flex min-h-screen items-center justify-center">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
        );
    }

    return (
        <div className="relative flex min-h-screen flex-col">
            <header className="sticky top-0 z-50 w-full border-b border-border/60 bg-background/95 backdrop-blur-lg supports-[backdrop-filter]:bg-background/60">
                <div className="mx-auto flex h-14 max-w-screen-2xl items-center px-4 sm:px-8">
                    <Link href="/" className="flex items-center gap-2 mr-6">
                        <div className="flex h-6 w-6 items-center justify-center rounded-md bg-foreground">
                            <Link2 className="h-3.5 w-3.5 text-background" />
                        </div>
                        <span className="font-semibold tracking-tight">Shrtly</span>
                    </Link>
                    <nav className="flex items-center gap-1 text-sm">
                        <Button variant="ghost" size="sm" className="text-foreground font-medium" asChild>
                            <Link href="/dashboard">Dashboard</Link>
                        </Button>
                    </nav>
                    <div className="ml-auto flex items-center gap-2">
                        <div className="flex items-center gap-1.5 rounded-md border border-border px-2.5 py-1.5 text-sm">
                            <User className="h-3.5 w-3.5 text-muted-foreground" />
                            <span className="text-muted-foreground">{user.name || user.email}</span>
                        </div>
                        <Button variant="ghost" size="sm" onClick={logout} className="gap-1.5 text-muted-foreground hover:text-foreground">
                            <LogOut className="h-3.5 w-3.5" />
                            Logout
                        </Button>
                        <ThemeToggle />
                    </div>
                </div>
            </header>

            <main className="flex-1">
                <div className="mx-auto max-w-screen-lg px-4 py-8 sm:px-8">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h1 className="text-2xl font-bold tracking-tight">My Links</h1>
                            <p className="text-sm text-muted-foreground mt-1">
                                Manage and track all your shortened links
                            </p>
                        </div>
                        <Button size="sm" className="gap-1.5" asChild>
                            <Link href="/">
                                <Plus className="h-4 w-4" />
                                New Link
                            </Link>
                        </Button>
                    </div>

                    <Separator className="mb-6" />

                    {loading ? (
                        <div className="flex items-center justify-center py-20">
                            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                        </div>
                    ) : urls.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-20 text-center">
                            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted mb-4">
                                <LinkIcon className="h-6 w-6 text-muted-foreground" />
                            </div>
                            <h2 className="text-lg font-semibold">No links yet</h2>
                            <p className="mt-1 text-sm text-muted-foreground">
                                Create your first shortened link to get started.
                            </p>
                            <Button size="sm" className="mt-4 gap-1.5" asChild>
                                <Link href="/">
                                    <Plus className="h-4 w-4" />
                                    Create Link
                                </Link>
                            </Button>
                        </div>
                    ) : (
                        <>
                            <div className="space-y-3">
                                {urls.map((url) => (
                                    <LinkCard key={url.id} url={url} onDelete={handleDelete} />
                                ))}
                            </div>

                            {totalPages > 1 && (
                                <div className="mt-6 flex items-center justify-center gap-2">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        disabled={page <= 1}
                                        onClick={() => setPage((p) => p - 1)}
                                    >
                                        Previous
                                    </Button>
                                    <span className="text-sm text-muted-foreground">
                                        Page {page} of {totalPages}
                                    </span>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        disabled={page >= totalPages}
                                        onClick={() => setPage((p) => p + 1)}
                                    >
                                        Next
                                    </Button>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </main>
        </div>
    );
}
