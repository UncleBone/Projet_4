import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export class TeacherRepo {
    async getTeacherById(teacherId: number) {
        const teacher = await prisma.teacher.findUnique({
            where: { id: teacherId },
        });

        return teacher
    }
}