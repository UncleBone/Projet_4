import { Request, Response } from 'express';
import { AuthService } from '../services/auth.service';

export class AuthController {
  private authService = new AuthService

  async login(req: Request, res: Response) {
    return this.authService.login(req.body,res)
  }

  async register(req: Request, res: Response) {
    return this.authService.register(req.body,res)
  }
}
