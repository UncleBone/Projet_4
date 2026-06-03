import { PrismaClient } from '@prisma/client';
import { Response } from 'express';
import { TeacherRepo } from '../repository/teacher.repo';

const prisma = new PrismaClient();

export class TeacherService {
    private teacherRepo = new TeacherRepo;

    async getAll(res: Response) {
        try {
          const teachers = await this.teacherRepo.getAll();
    
          const response: any = teachers.map((teacher: any) => ({
            id: teacher.id,
            firstName: teacher.firstName,
            lastName: teacher.lastName,
            createdAt: teacher.createdAt,
            updatedAt: teacher.updatedAt,
          }));
    
          return res.status(200).json(response);
        } catch (error: any) {
          console.error('Get teachers error:', error);
          return res.status(500).json({ message: 'Internal server error' });
        }
    }

    async getById(id: string, res: Response) {
        try {
          if (!id) {
            return res.status(400).json({ message: 'Teacher ID is required' });
          }
    
          const teacherId = parseInt(id);
    
          if (isNaN(teacherId)) {
            return res.status(400).json({ message: 'Invalid teacher ID' });
          }
    
          const teacher = await this.teacherRepo.getTeacherById(teacherId);
    
          if (!teacher) {
            return res.status(404).json({ message: 'Teacher not found' });
          }
    
          const response: any = {
            id: teacher.id,
            firstName: teacher.firstName,
            lastName: teacher.lastName,
            createdAt: teacher.createdAt,
            updatedAt: teacher.updatedAt,
          };
    
          return res.status(200).json(response);
        } catch (error: any) {
          console.error('Get teacher error:', error);
          return res.status(500).json({ message: 'Internal server error' });
        }
    }
}