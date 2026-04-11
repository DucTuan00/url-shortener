'use client';

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/components/auth-provider';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { ThemeToggle } from '@/components/layout/theme-toggle';
import { Link2, AlertCircle, Mail, Lock, User } from 'lucide-react';

export default function RegisterPage() {
    const router = useRouter();
    const { register } = useAuth();
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            await register(email, password, name || undefined);
            router.push('/dashboard');
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Registration failed');
        } finally {
            setLoading(false);
        }
    };

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
                    <div className="ml-auto flex items-center gap-1">
                        <ThemeToggle />
                    </div>
                </div>
            </header>

            <main className="flex flex-1 items-center justify-center px-4 py-12">
                <Card className="w-full max-w-sm border-border">
                    <CardContent className="p-6">
                        <div className="mb-6 text-center">
                            <h1 className="text-2xl font-bold tracking-tight">Create account</h1>
                            <p className="mt-1 text-sm text-muted-foreground">
                                Sign up to manage and track your links
                            </p>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="name" className="flex items-center gap-1.5 text-sm">
                                    <User className="h-3.5 w-3.5 text-muted-foreground" />
                                    Name
                                    <span className="ml-1 text-xs text-muted-foreground font-normal">(optional)</span>
                                </Label>
                                <Input
                                    id="name"
                                    type="text"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    placeholder="Your name"
                                    className="h-10"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="email" className="flex items-center gap-1.5 text-sm">
                                    <Mail className="h-3.5 w-3.5 text-muted-foreground" />
                                    Email
                                </Label>
                                <Input
                                    id="email"
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="you@example.com"
                                    required
                                    className="h-10"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="password" className="flex items-center gap-1.5 text-sm">
                                    <Lock className="h-3.5 w-3.5 text-muted-foreground" />
                                    Password
                                </Label>
                                <Input
                                    id="password"
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="Min. 8 characters"
                                    required
                                    minLength={8}
                                    className="h-10"
                                />
                            </div>

                            {error && (
                                <div className="flex items-center gap-2 rounded-md border border-destructive/50 bg-destructive/5 p-3">
                                    <AlertCircle className="h-4 w-4 text-destructive shrink-0" />
                                    <p className="text-sm text-destructive">{error}</p>
                                </div>
                            )}

                            <Button type="submit" disabled={loading} className="w-full h-10">
                                {loading ? 'Creating account…' : 'Create account'}
                            </Button>
                        </form>

                        <p className="mt-6 text-center text-sm text-muted-foreground">
                            Already have an account?{' '}
                            <Link href="/login" className="font-medium text-foreground hover:underline">
                                Sign in
                            </Link>
                        </p>
                    </CardContent>
                </Card>
            </main>
        </div>
    );
}
