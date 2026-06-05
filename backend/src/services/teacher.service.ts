import { PrismaClient, Teacher } from '@prisma/client';
import { Response } from 'express';
import { TeacherRepo } from '../repository/teacher.repo';

const prisma = new PrismaClient();

export class TeacherService {
  private teacherRepo = new TeacherRepo;

  async getAll(res: Response) {
    const teachers = await this.teacherRepo.getAll();

    const response: Array<Teacher> = teachers.map((teacher: Teacher) => ({
      id: teacher.id,
      firstName: teacher.firstName,
      lastName: teacher.lastName,
      createdAt: teacher.createdAt,
      updatedAt: teacher.updatedAt,
    }));

    return res.status(200).json(response);
  }

  async getById(id: string, res: Response) {
    if (!id) {
      throw({ status: 400, message: 'Teacher ID is required' });
    }

    const teacherId = parseInt(id);

    if (isNaN(teacherId)) {
      throw({ status: 400, message: 'Invalid teacher ID' });
    }

    const teacher = await this.teacherRepo.getTeacherById(teacherId);

    if (!teacher) {
      throw({ status: 404, message: 'Teacher not found' });
    }

    const response: Teacher = {
      id: teacher.id,
      firstName: teacher.firstName,
      lastName: teacher.lastName,
      createdAt: teacher.createdAt,
      updatedAt: teacher.updatedAt,
    };

    return res.status(200).json(response);
  }
}