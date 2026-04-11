import UrlShortenerApp from '@/components/url-shortener-app';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Zap, Shield, BarChart3, Code2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Header from '@/components/layout/header';

export default function Home() {
    return (
        <div className="relative flex min-h-screen flex-col">
            <Header />

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
