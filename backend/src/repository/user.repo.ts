import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export class UserRepo {
    async getUserById(userId: number) {
        const user = await prisma.user.findUnique({
            where: { id: userId },
        });

        return user
    }

    async delete(userId: number) {
        await prisma.user.delete({
            where: { id: userId },
        });
    }

    async promote(userId: number) {
        const user = await prisma.user.update({
            where: { id: userId },
            data: { admin: true },
        });
        return user
    }
}