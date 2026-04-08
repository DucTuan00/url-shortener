import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import '@/app/globals.css';

const inter = Inter({
    subsets: ['latin'],
    variable: '--font-inter',
    display: 'swap',
});

export const metadata: Metadata = {
    title: 'URL Shortener',
    description: 'Shorten your URLs quickly and easily',
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="en" className={inter.variable}>
            <body className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 font-sans antialiased dark:from-gray-900 dark:to-gray-950">
                {children}
            </body>
        </html>
    );
}
