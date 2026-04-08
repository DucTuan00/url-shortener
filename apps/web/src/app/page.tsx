import UrlShortenerApp from '@/components/url-shortener-app';

export default function Home() {
    return (
        <main className="flex min-h-screen flex-col items-center px-4 pt-20">
            <div className="w-full max-w-2xl text-center">
                <h1 className="mb-2 text-4xl font-bold tracking-tight text-gray-900 dark:text-white">
                    URL Shortener
                </h1>
                <p className="mb-8 text-lg text-gray-600 dark:text-gray-400">
                    Shorten your links, share them easily
                </p>

                <UrlShortenerApp />
            </div>
        </main>
    );
}
