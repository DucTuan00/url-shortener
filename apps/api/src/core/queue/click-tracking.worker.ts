import { Worker, Job } from 'bullmq';
import { UAParser } from 'ua-parser-js';
import geoip from 'geoip-lite';
import { config } from '@/core/config';
import { CLICK_QUEUE_NAME } from '@/core/queue/click-tracking.queue';
import { ClickRepository } from '@/modules/analytics/click.repository';
import { ParsedClickData } from '@/modules/analytics/analytics.types';

interface ClickJobData {
    urlId: string;
    ipAddress: string | null;
    userAgent: string | null;
    referer: string | null;
}

const clickRepository = new ClickRepository();

function parseClickData(data: ClickJobData): ParsedClickData {
    let country: string | null = null;
    let city: string | null = null;
    let deviceType: string | null = null;
    let browser: string | null = null;
    let os: string | null = null;

    // Parse User-Agent
    if (data.userAgent) {
        const parser = new UAParser(data.userAgent);
        const result = parser.getResult();
        browser = result.browser.name || null;
        os = result.os.name || null;
        deviceType = result.device.type || 'desktop'; // default to desktop if not mobile/tablet
    }

    // Geo-IP lookup
    if (data.ipAddress && data.ipAddress !== '127.0.0.1' && data.ipAddress !== '::1') {
        const geo = geoip.lookup(data.ipAddress);
        if (geo) {
            country = geo.country || null;
            city = geo.city || null;
        }
    }

    return {
        urlId: BigInt(data.urlId),
        ipAddress: data.ipAddress,
        userAgent: data.userAgent,
        referer: data.referer,
        country,
        city,
        deviceType,
        browser,
        os,
    };
}

export function startClickTrackingWorker(): Worker {
    const worker = new Worker(
        CLICK_QUEUE_NAME,
        async (job: Job<ClickJobData>) => {
            const parsed = parseClickData(job.data);
            await clickRepository.create(parsed);
        },
        {
            connection: {
                host: new URL(config.redisUrl).hostname,
                port: parseInt(new URL(config.redisUrl).port || '6379'),
            },
            concurrency: 10,
        },
    );

    worker.on('completed', (job) => {
        // Silent on success
    });

    worker.on('failed', (job, err) => {
        console.error(`❌ Click tracking job ${job?.id} failed:`, err.message);
    });

    console.log('✅ Click tracking worker started');
    return worker;
}
