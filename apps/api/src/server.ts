import app from '@/app';
import { config } from '@/core/config';

const start = async () => {
    try {
        app.listen(config.port, () => {
            console.log(`🚀 API server running at http://localhost:${config.port}`);
            console.log(`📝 Environment: ${config.env}`);
        });
    } catch (error) {
        console.error('Failed to start server:', error);
        process.exit(1);
    }
};

start();
