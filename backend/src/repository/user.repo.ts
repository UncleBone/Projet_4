import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export class UserRepo {
    async getUserById(userId: number) {
        const user = await prisma.user.findUnique({
            where: { id: userId },
        });

        return user
    }
}