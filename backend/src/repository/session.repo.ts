import { PrismaClient } from '@prisma/client';
import { CreateSessionDto, UpdateSessionDto } from '../dto/session.dto';

const prisma = new PrismaClient();

export class SessionRepo {
    async getAll() {
        const sessions = await prisma.session.findMany({
            include: {
              teacher: true,
              participants: {
                include: {
                  user: true,
                },
              },
            },
        });

        return sessions
    }

    async getSessionById(sessionId: number) {
        const session = await prisma.session.findUnique({
            where: { id: sessionId },
            include: {
              teacher: true,
              participants: {
                include: {
                  user: true,
                },
              },
            },
        });

        return session
    }

    async create(data: CreateSessionDto) {
        const createData = { 
            name: data.name,
            description: data.description,
            teacherId: data.teacherId,
            date: new Date(data.date)
        };
        const session = await prisma.session.create({
            data: createData,
            include: {
              teacher: true,
              participants: true,
            },
        });
        return session
    }

    async update(data: UpdateSessionDto, sessionId: number) {
        const session = await prisma.session.update({
            where: { id: sessionId },
            data,
            include: {
              teacher: true,
              participants: {
                include: {
                  user: true,
                },
              },
            },
        });
        return session
    }

    async delete(sessionId: number) {
        await prisma.session.delete({
            where: { id: sessionId },
        });
    }

    async getSessionParticipation(sessionId: number, userId: number) {
        const participation = await prisma.sessionParticipation.findUnique({
            where: {
              sessionId_userId: {
                sessionId,
                userId,
              },
            },
          });

        return participation
    }

    async createSessionParticipation(sessionId: number, userId: number) {
        await prisma.sessionParticipation.create({
            data: {
                sessionId,
                userId,
            },
        });
    }

    async deleteSessionParticipation(sessionId: number, userId: number) {
        await prisma.sessionParticipation.delete({
            where: {
              sessionId_userId: {
                sessionId,
                userId,
                },
            },
        });
    }

}