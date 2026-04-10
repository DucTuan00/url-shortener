import app from '@/app';
import { config } from '@/core/config';
import prisma from '@/core/database/prisma';

const start = async () => {
    try {
        await prisma.$connect();
        console.log('✅ Database connected');
    } catch (error) {
        console.error('❌ Database connection failed:', error);
        process.exit(1);
    }

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
