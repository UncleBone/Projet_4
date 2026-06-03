import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import { TeacherService } from '../services/teacher.service';

export class TeacherController {
  private teacherService = new TeacherService;

  async getAll(req: AuthRequest, res: Response) {
    return this.teacherService.getAll(res)
  }

  async getById(req: AuthRequest, res: Response) {
    const { id } = req.params as { id: string };
    return this.teacherService.getById(id,res)
  }
}
