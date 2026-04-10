import { Queue } from 'bullmq';
import { config } from '@/core/config';
import { ClickData } from '@/modules/analytics/analytics.types';

export const CLICK_QUEUE_NAME = 'click-tracking';

export const clickQueue = new Queue(CLICK_QUEUE_NAME, {
    connection: {
        host: new URL(config.redisUrl).hostname,
        port: parseInt(new URL(config.redisUrl).port || '6379'),
    },
    defaultJobOptions: {
        removeOnComplete: 1000,
        removeOnFail: 5000,
        attempts: 3,
        backoff: {
            type: 'exponential',
            delay: 1000,
        },
    },
});

export async function enqueueClick(data: ClickData): Promise<void> {
    await clickQueue.add('track-click', {
        urlId: data.urlId.toString(),
        ipAddress: data.ipAddress,
        userAgent: data.userAgent,
        referer: data.referer,
    });
}
