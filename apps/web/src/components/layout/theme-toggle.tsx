'use client';

import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { Moon, Sun } from 'lucide-react';

export function ThemeToggle() {
    const { theme, setTheme } = useTheme();
    const [mounted, setMounted] = useState(false);

    // Avoid hydration mismatch — render only after mount
    useEffect(() => setMounted(true), []);

    if (!mounted) {
        return <div className="size-8" />;
    }

    const isDark = theme === 'dark';

    return (
        <Tooltip>
            <TooltipTrigger asChild>
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setTheme(isDark ? 'light' : 'dark')}
                    aria-label="Toggle theme"
                >
                    {isDark ? (
                        <Sun className="h-4 w-4" />
                    ) : (
                        <Moon className="h-4 w-4" />
                    )}
                </Button>
            </TooltipTrigger>
            <TooltipContent side="bottom">
                {isDark ? 'Switch to light mode' : 'Switch to dark mode'}
            </TooltipContent>
        </Tooltip>
    );
}
