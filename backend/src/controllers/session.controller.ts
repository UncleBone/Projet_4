import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import { SessionService } from '../services/session.service';

export class SessionController {
  private sessionService = new SessionService;

  async getAll(req: AuthRequest, res: Response) {
    return this.sessionService.getAll(res)
  }

  async getById(req: AuthRequest, res: Response) {
    const { id } = req.params as { id: string };
    return this.sessionService.getById(id,res)
  }

  async create(req: AuthRequest, res: Response) {
    const { userId, body } = req;
    return this.sessionService.create(userId,body,res)
  }

  async update(req: AuthRequest, res: Response) {
    const { id } = req.params as { id: string };
    const { userId, body } = req;
    return this.sessionService.update(userId,id,body,res);
  }

  async delete(req: AuthRequest, res: Response) {
    const { id } = req.params as { id: string };
    const { userId } = req;
    return this.sessionService.delete(userId,id,res)
  }

  async participate(req: AuthRequest, res: Response) {
    const { id, userId } = req.params as { id: string, userId: string };
    return this.sessionService.participate(userId,id,res)
  }

  async unparticipate(req: AuthRequest, res: Response) {
    const { id, userId } = req.params as { id: string, userId: string };
    return this.sessionService.unparticipate(userId,id,res)
  }
}
