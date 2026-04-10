import UrlShortenerApp from '@/components/url-shortener-app';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ThemeToggle } from '@/components/layout/theme-toggle';
import { Link2, Zap, Shield, BarChart3, ExternalLink, Code2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function Home() {
    return (
        <div className="relative flex min-h-screen flex-col">
            {/* Header — shadcn style: border-b, backdrop-blur */}
            <header className="sticky top-0 z-50 w-full border-b border-border/60 bg-background/95 backdrop-blur-lg supports-[backdrop-filter]:bg-background/60">
                <div className="mx-auto flex h-14 max-w-screen-2xl items-center px-4 sm:px-8">
                    {/* Logo */}
                    <div className="flex items-center gap-2 mr-6">
                        <div className="flex h-6 w-6 items-center justify-center rounded-md bg-foreground">
                            <Link2 className="h-3.5 w-3.5 text-background" />
                        </div>
                        <span className="font-semibold tracking-tight">Shrtly</span>
                    </div>

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
                        <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground" asChild>
                            <a href="https://github.com" target="_blank" rel="noopener noreferrer" aria-label="GitHub">
                                <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor"><path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0 1 12 6.844a9.59 9.59 0 0 1 2.504.337c1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.02 10.02 0 0 0 22 12.017C22 6.484 17.522 2 12 2Z" /></svg>
                            </a>
                        </Button>
                        <ThemeToggle />
                    </div>
                </div>
            </header>

            {/* Main content */}
            <main className="flex-1">
                <div className="mx-auto flex max-w-screen-2xl flex-col items-center px-4 pb-20 pt-16 sm:px-8 sm:pt-24">
                    {/* Badge pill */}
                    <a
                        href="#"
                        className="group mb-6 inline-flex items-center gap-1 rounded-full border border-border bg-muted px-3 py-1 text-sm text-muted-foreground transition-colors hover:border-foreground/20 hover:text-foreground"
                    >
                        <span className="mr-1 inline-block h-1.5 w-1.5 rounded-full bg-emerald-500" />
                        Introducing Shrtly
                        <span className="transition-transform group-hover:translate-x-0.5">→</span>
                    </a>

                    {/* Heading */}
                    <h1 className="max-w-3xl text-center text-3xl font-bold tracking-tight sm:text-5xl md:text-6xl">
                        Shorten any link.{' '}
                        <span className="text-muted-foreground">
                            Share it everywhere.
                        </span>
                    </h1>

                    {/* Subheading */}
                    <p className="mt-4 max-w-[42rem] text-center text-base text-muted-foreground sm:text-lg">
                        An open-source URL shortener built with Next.js and Express.
                        Paste a link, get a short URL, track analytics.
                    </p>

                    {/* CTA */}
                    <div className="mt-8 flex items-center gap-3">
                        <Button size="lg" className="h-10 px-6 font-medium">
                            Get Started
                        </Button>
                        <Button variant="outline" size="lg" className="h-10 px-6 font-medium">
                            <Code2 className="mr-2 h-4 w-4" />
                            Source Code
                        </Button>
                    </div>

                    <Separator className="my-12 max-w-2xl" />

                    {/* URL Shortener App */}
                    <div className="w-full max-w-2xl">
                        <UrlShortenerApp />
                    </div>

                    {/* Feature section */}
                    <div className="mt-20 grid w-full max-w-3xl grid-cols-1 gap-4 sm:grid-cols-3">
                        <div className="group rounded-lg border border-border bg-card p-4 transition-colors hover:border-foreground/20">
                            <div className="mb-3 flex h-8 w-8 items-center justify-center rounded-md bg-muted">
                                <Zap className="h-4 w-4 text-foreground" />
                            </div>
                            <h3 className="mb-1 text-sm font-medium">Lightning Fast</h3>
                            <p className="text-xs text-muted-foreground leading-relaxed">
                                302 redirects with Redis caching for sub-10ms response times.
                            </p>
                        </div>
                        <div className="group rounded-lg border border-border bg-card p-4 transition-colors hover:border-foreground/20">
                            <div className="mb-3 flex h-8 w-8 items-center justify-center rounded-md bg-muted">
                                <Shield className="h-4 w-4 text-foreground" />
                            </div>
                            <h3 className="mb-1 text-sm font-medium">Custom Aliases</h3>
                            <p className="text-xs text-muted-foreground leading-relaxed">
                                Choose your own short code. Brand your links however you want.
                            </p>
                        </div>
                        <div className="group rounded-lg border border-border bg-card p-4 transition-colors hover:border-foreground/20">
                            <div className="mb-3 flex h-8 w-8 items-center justify-center rounded-md bg-muted">
                                <BarChart3 className="h-4 w-4 text-foreground" />
                            </div>
                            <h3 className="mb-1 text-sm font-medium">Analytics</h3>
                            <p className="text-xs text-muted-foreground leading-relaxed">
                                Track clicks, devices, and locations. Coming in Phase 3.
                            </p>
                        </div>
                    </div>
                </div>
            </main>

            {/* Footer */}
            <footer className="border-t border-border py-6">
                <div className="mx-auto flex max-w-screen-2xl items-center justify-between px-4 text-xs text-muted-foreground sm:px-8">
                    <span>Built with Next.js, Express & shadcn/ui</span>
                    <span>Open Source</span>
                </div>
            </footer>
        </div>
    );
}
