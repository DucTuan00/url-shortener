import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import { cn } from "@/lib/utils";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/theme-provider";
import { AuthProvider } from "@/components/auth-provider";

const geistSans = Geist({
    subsets: ['latin'],
    variable: '--font-geist-sans',
});

const geistMono = Geist_Mono({
    subsets: ['latin'],
    variable: '--font-geist-mono',
});

export const metadata: Metadata = {
    title: 'URL Shortener — Shorten links instantly',
    description: 'Shorten your URLs quickly and easily. Share smarter with custom aliases.',
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html
            lang="en"
            className={cn(geistSans.variable, geistMono.variable)}
            suppressHydrationWarning
        >
            <body className="min-h-screen bg-background font-sans antialiased" suppressHydrationWarning>
                <ThemeProvider>
                    <AuthProvider>
                        <TooltipProvider>
                            {children}
                        </TooltipProvider>
                    </AuthProvider>
                </ThemeProvider>
            </body>
        </html>
    );
}
