'use client';

import Link from 'next/link';
import { useAuth } from '@/components/auth-provider';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/layout/theme-toggle';
import { Link2, LogOut, LayoutDashboard, User } from 'lucide-react';

export default function Header() {
    const { user, logout } = useAuth();

    return (
        <header className="sticky top-0 z-50 w-full border-b border-border/60 bg-background/95 backdrop-blur-lg supports-[backdrop-filter]:bg-background/60">
            <div className="mx-auto flex h-14 max-w-screen-2xl items-center px-4 sm:px-8">
                {/* Logo */}
                <Link href="/" className="flex items-center gap-2 mr-6">
                    <div className="flex h-6 w-6 items-center justify-center rounded-md bg-foreground">
                        <Link2 className="h-3.5 w-3.5 text-background" />
                    </div>
                    <span className="font-semibold tracking-tight">Shrtly</span>
                </Link>

                {/* Nav links */}
                <nav className="flex items-center gap-1 text-sm">
                    <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
                        Term of Service
                    </Button>
                    <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
                        Privacy
                    </Button>
                </nav>

                {/* Right side */}
                <div className="ml-auto flex items-center gap-1">
                    {user ? (
                        <>
                            <Button variant="ghost" size="sm" className="gap-1.5" asChild>
                                <Link href="/dashboard">
                                    <LayoutDashboard className="h-3.5 w-3.5" />
                                    Dashboard
                                </Link>
                            </Button>
                            <div className="flex items-center gap-1.5 rounded-md border border-border px-2 py-1 text-xs text-muted-foreground">
                                <User className="h-3 w-3" />
                                {user.name || user.email}
                            </div>
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={logout}
                                className="text-muted-foreground hover:text-foreground"
                            >
                                <LogOut className="h-4 w-4" />
                            </Button>
                        </>
                    ) : (
                        <>
                            <Button variant="ghost" size="sm" asChild>
                                <Link href="/login">Sign in</Link>
                            </Button>
                            <Button size="sm" asChild>
                                <Link href="/register">Sign up</Link>
                            </Button>
                        </>
                    )}
                    <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground" asChild>
                        <a href="https://github.com" target="_blank" rel="noopener noreferrer" aria-label="GitHub">
                            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor"><path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0 1 12 6.844a9.59 9.59 0 0 1 2.504.337c1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.02 10.02 0 0 0 22 12.017C22 6.484 17.522 2 12 2Z" /></svg>
                        </a>
                    </Button>
                    <ThemeToggle />
                </div>
            </div>
        </header>
    );
}
