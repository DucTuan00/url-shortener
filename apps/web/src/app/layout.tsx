import type { Metadata } from 'next';
import { Geist } from 'next/font/google';
import '@/app/globals.css';
import { cn } from "@/lib/utils";

const geist = Geist({ subsets: ['latin'], variable: '--font-sans' });

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
        <html lang="en" className={cn("font-sans", geist.variable)}>
            <body className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 font-sans antialiased dark:from-gray-900 dark:to-gray-950">
                {children}
            </body>
        </html>
    );
}
