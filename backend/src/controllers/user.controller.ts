import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import { UserService } from '../services/user.service';

export class UserController {
  private userService = new UserService;
  
  async getById(req: AuthRequest, res: Response) {
    return this.userService.getById(req,res)
  }

  async delete(req: AuthRequest, res: Response) {
    return this.userService.delete(req,res)
  }

  async promoteSelfToAdmin(req: AuthRequest, res: Response) {
    return this.userService.promoteSelfToAdmin(req,res)
  }
}
