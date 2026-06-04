import { PrismaClient } from '@prisma/client';
import { CreateUserDto } from '../dto/user.dto';

const prisma = new PrismaClient();

export class UserRepo {
    async findUser(email: string) {
        const user = await prisma.user.findUnique({
            where: { email },
        });
        return user
    }

    async getUserById(userId: number) {
        const user = await prisma.user.findUnique({
            where: { id: userId },
        });

        return user
    }

    async createUser(data: CreateUserDto) {
            const user = await prisma.user.create({ data });
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