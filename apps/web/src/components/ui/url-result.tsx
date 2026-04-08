'use client';

import { useCopyToClipboard } from '@/hooks/use-copy-clipboard';

interface UrlResultProps {
    shortUrl: string;
    originalUrl: string;
}

export default function UrlResult({ shortUrl, originalUrl }: UrlResultProps) {
    const { copied, copy } = useCopyToClipboard();

    return (
        <div className="flex items-center justify-between rounded-lg border border-green-200 bg-green-50 p-4 dark:border-green-800 dark:bg-green-900/20">
            <div className="min-w-0 flex-1">
                <a
                    href={shortUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block truncate text-lg font-medium text-blue-600 hover:underline dark:text-blue-400"
                >
                    {shortUrl}
                </a>
                <p className="truncate text-sm text-gray-500 dark:text-gray-400">
                    {originalUrl}
                </p>
            </div>
            <button
                onClick={() => copy(shortUrl)}
                className="ml-4 shrink-0 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700"
            >
                {copied ? '✓ Copied!' : 'Copy'}
            </button>
        </div>
    );
}
