'use client';

import { useCopyToClipboard } from '@/hooks/use-copy-clipboard';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { Copy, Check, ExternalLink, Link2 } from 'lucide-react';

interface UrlResultProps {
    shortUrl: string;
    originalUrl: string;
}

export default function UrlResult({ shortUrl, originalUrl }: UrlResultProps) {
    const { copied, copy } = useCopyToClipboard();

    return (
        <Card className="w-full overflow-hidden border-border">
            <CardContent className="p-0">
                <div className="flex items-center gap-3 border-b border-border px-4 py-3">
                    <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-muted">
                        <Link2 className="h-3.5 w-3.5 text-foreground" />
                    </div>
                    <div className="min-w-0 flex-1">
                        <a
                            href={shortUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1.5 text-sm font-medium text-foreground transition-colors hover:underline"
                        >
                            <span className="truncate">{shortUrl}</span>
                            <ExternalLink className="h-3 w-3 shrink-0 text-muted-foreground" />
                        </a>
                    </div>
                    <Badge variant="outline" className="shrink-0 text-xs">
                        Active
                    </Badge>
                </div>

                <div className="flex items-center gap-3 px-4 py-3">
                    <p className="min-w-0 flex-1 truncate text-xs text-muted-foreground">
                        {originalUrl}
                    </p>
                    <div className="flex items-center gap-1.5">
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => copy(shortUrl)}
                                    className="shrink-0 gap-1.5"
                                >
                                    {copied ? (
                                        <>
                                            <Check className="h-3.5 w-3.5 text-green-600" />
                                            Copied
                                        </>
                                    ) : (
                                        <>
                                            <Copy className="h-3.5 w-3.5" />
                                            Copy
                                        </>
                                    )}
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent side="top">
                                {copied ? 'Copied to clipboard!' : 'Copy short URL'}
                            </TooltipContent>
                        </Tooltip>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
