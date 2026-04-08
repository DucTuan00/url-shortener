'use client';

import { useState, FormEvent } from 'react';
import { shortenUrl, ShortenResponse } from '@/lib/api';

interface ShortenFormProps {
    onSuccess?: (data: ShortenResponse['data']) => void;
}

export default function ShortenForm({ onSuccess }: ShortenFormProps) {
    const [url, setUrl] = useState('');
    const [customAlias, setCustomAlias] = useState('');
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
            );
            onSuccess?.(result.data);
            setUrl('');
            setCustomAlias('');
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Something went wrong');
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="w-full max-w-2xl space-y-4">
            <div className="flex gap-2">
                <input
                    type="url"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    placeholder="Paste your long URL here..."
                    required
                    className="flex-1 rounded-lg border border-gray-300 px-4 py-3 text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-gray-600 dark:bg-gray-800 dark:text-white dark:placeholder-gray-500"
                />
                <button
                    type="submit"
                    disabled={loading || !url}
                    className="rounded-lg bg-blue-600 px-6 py-3 font-medium text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                    {loading ? 'Shortening...' : 'Shorten'}
                </button>
            </div>

            <button
                type="button"
                onClick={() => setShowOptions(!showOptions)}
                className="text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            >
                {showOptions ? '▾ Hide options' : '▸ More options'}
            </button>

            {showOptions && (
                <div className="space-y-3 rounded-lg border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-800/50">
                    <div>
                        <label htmlFor="alias" className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                            Custom alias (optional)
                        </label>
                        <input
                            id="alias"
                            type="text"
                            value={customAlias}
                            onChange={(e) => setCustomAlias(e.target.value)}
                            placeholder="my-custom-link"
                            pattern="^[a-zA-Z0-9_-]+$"
                            minLength={3}
                            maxLength={50}
                            className="w-full rounded-lg border border-gray-300 px-4 py-2 text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                        />
                    </div>
                </div>
            )}

            {error && (
                <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
            )}
        </form>
    );
}
