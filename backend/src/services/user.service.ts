import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import { UserRepo } from '../repository/user.repo';
import { User } from '@prisma/client';


export class UserService {
    private userRepo = new UserRepo;

    async getById(req: AuthRequest, res: Response) {
      const { id } = req.params as { id: string };

      if (!id) {
        throw({ status: 400, message: 'User ID is required' });
      }

      const userId = parseInt(id);

      if (isNaN(userId)) {
        throw({ status: 400, message: 'Invalid user ID' });
      }

      const user = await this.userRepo.getUserById(userId);

      if (!user) {
        throw({ status: 404, message: 'User not found' });
      }

      const response: Omit<User,"password"> = {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        admin: user.admin,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      };

      return res.status(200).json(response);
    }

    async delete(req: AuthRequest, res: Response) {
      const { id } = req.params as { id: string };

      if (!id) {
        throw({ status: 400, message: 'User ID is required' });
      }

      const userId = parseInt(id);

      if (isNaN(userId)) {
        throw({ status: 400, message: 'Invalid user ID' });
      }

      if (req.userId !== userId) {
        throw({ status: 403, message: 'You can only delete your own account' });
      }

      const user = await this.userRepo.getUserById(userId);

      if (!user) {
        throw({ status: 404, message: 'User not found' });
      }

      await this.userRepo.delete(userId);

      return res.status(200).json({ message: 'User deleted successfully' });
    }

    async promoteSelfToAdmin(req: AuthRequest, res: Response) {
      const isDev = (process.env.NODE_ENV || 'development') === 'development';
      if (!isDev) {
        throw({ status: 403, message: 'Admin self-promotion is only available in development' });
      }

      if (!req.userId) {
        throw({ status: 401, message: 'Unauthorized' });
      }

      const user = await this.userRepo.getUserById(req.userId);

      if (!user) {
        throw({ status: 404, message: 'User not found' });
      }

      if (user.admin) {
        return res.status(200).json({
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          admin: user.admin,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt,
        });
      }

      const updatedUser = await this.userRepo.promote(user.id);

      return res.status(200).json({
        id: updatedUser.id,
        email: updatedUser.email,
        firstName: updatedUser.firstName,
        lastName: updatedUser.lastName,
        admin: updatedUser.admin,
        createdAt: updatedUser.createdAt,
        updatedAt: updatedUser.updatedAt,
      });
    }
}