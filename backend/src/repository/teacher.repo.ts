import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export class TeacherRepo {
    async getAll() {
        const teachers = await prisma.teacher.findMany({
            orderBy: {
                createdAt: 'desc',
            },
        });
        return teachers
    }

    async getTeacherById(teacherId: number) {
        const teacher = await prisma.teacher.findUnique({
            where: { id: teacherId },
        });

        return teacher
    }
}