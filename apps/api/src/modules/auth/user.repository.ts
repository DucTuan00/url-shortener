import prisma from '@/core/database/prisma';

export class UserRepository {
    async create(data: { email: string; passwordHash: string; name?: string }) {
        return prisma.user.create({
            data: {
                email: data.email,
                passwordHash: data.passwordHash,
                name: data.name || null,
            },
        });
    }

    async findByEmail(email: string) {
        return prisma.user.findUnique({
            where: { email },
        });
    }

    async findById(id: bigint) {
        return prisma.user.findUnique({
            where: { id },
        });
    }
}
