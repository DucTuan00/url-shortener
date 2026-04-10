'use client';

import { useState, FormEvent } from 'react';
import { shortenUrl, ShortenResponse } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { DateTimePicker } from '@/components/ui/date-time-picker';
import { Link2, ChevronDown, ChevronUp, Scissors, AtSign, AlertCircle, Clock } from 'lucide-react';

interface ShortenFormProps {
    onSuccess?: (data: ShortenResponse['data']) => void;
}

export default function ShortenForm({ onSuccess }: ShortenFormProps) {
    const [url, setUrl] = useState('');
    const [customAlias, setCustomAlias] = useState('');
    const [expiresAt, setExpiresAt] = useState<Date | undefined>(undefined);
    const [showOptions, setShowOptions] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const result = await shortenUrl(
                url,
                customAlias || undefined,
                expiresAt ? expiresAt.toISOString() : undefined,
            );
            onSuccess?.(result.data);
            setUrl('');
            setCustomAlias('');
            setExpiresAt(undefined);
            setShowOptions(false);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Something went wrong');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Card className="w-full border-border bg-card">
            <CardContent className="p-5 sm:p-6">
                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* URL input row */}
                    <div className="flex gap-2">
                        <div className="relative flex-1">
                            <Link2 className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground pointer-events-none" />
                            <Input
                                type="url"
                                value={url}
                                onChange={(e) => setUrl(e.target.value)}
                                placeholder="https://example.com/your-very-long-url..."
                                required
                                className="h-10 pl-9"
                                aria-label="Long URL to shorten"
                            />
                        </div>
                        <Button
                            type="submit"
                            disabled={loading || !url}
                            className="h-10 gap-2 px-5"
                        >
                            <Scissors className="h-4 w-4" />
                            {loading ? 'Shortening…' : 'Shorten'}
                        </Button>
                    </div>

                    {/* Toggle more options */}
                    <button
                        type="button"
                        onClick={() => setShowOptions(!showOptions)}
                        className="flex items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-foreground"
                    >
                        {showOptions ? (
                            <ChevronUp className="h-3.5 w-3.5" />
                        ) : (
                            <ChevronDown className="h-3.5 w-3.5" />
                        )}
                        {showOptions ? 'Hide options' : 'More options'}
                    </button>

                    {/* Expandable options */}
                    {showOptions && (
                        <>
                            <Separator />
                            <div className="space-y-2">
                                <Label htmlFor="alias" className="flex items-center gap-1.5 text-sm">
                                    <AtSign className="h-3.5 w-3.5 text-muted-foreground" />
                                    Custom alias
                                    <span className="ml-1 text-xs text-muted-foreground font-normal">(optional)</span>
                                </Label>
                                <div className="flex items-center gap-1.5">
                                    <span className="text-sm text-muted-foreground shrink-0">short.ly/</span>
                                    <Input
                                        id="alias"
                                        type="text"
                                        value={customAlias}
                                        onChange={(e) => setCustomAlias(e.target.value)}
                                        placeholder="my-custom-link"
                                        pattern="^[a-zA-Z0-9_-]+$"
                                        minLength={3}
                                        maxLength={50}
                                        className="h-9"
                                    />
                                </div>
                                <p className="text-xs text-muted-foreground">
                                    Letters, numbers, hyphens and underscores only (3–50 chars)
                                </p>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="expires" className="flex items-center gap-1.5 text-sm">
                                    <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                                    Expiration date
                                    <span className="ml-1 text-xs text-muted-foreground font-normal">(optional)</span>
                                </Label>
                                <DateTimePicker
                                    value={expiresAt}
                                    onChange={setExpiresAt}
                                    placeholder="Pick expiration date & time"
                                    minDate={new Date()}
                                />
                                <p className="text-xs text-muted-foreground">
                                    Link will stop working after this date
                                </p>
                            </div>
                        </>
                    )}

                    {/* Error message */}
                    {error && (
                        <div className="flex items-center gap-2 rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">
                            <AlertCircle className="h-4 w-4 shrink-0" />
                            {error}
                        </div>
                    )}
                </form>
            </CardContent>
        </Card>
    );
}
