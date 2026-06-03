import { PrismaClient } from '@prisma/client';
import { CreateUserDto } from '../dto/user.dto';

const prisma = new PrismaClient();

export class AuthRepo {
    
    async findUser(email: string) {
        const user = await prisma.user.findUnique({
            where: { email },
        });
        return user
    }

    async createUser(data: CreateUserDto) {
        const user = await prisma.user.create({ data });
        return user
    }
}