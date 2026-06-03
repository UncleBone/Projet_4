import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import { UserRepo } from '../repository/user.repo';


export class UserService {
    private userRepo = new UserRepo;

    async getById(req: AuthRequest, res: Response) {
        try {
          const { id } = req.params as { id: string };
    
          if (!id) {
            return res.status(400).json({ message: 'User ID is required' });
          }
    
          const userId = parseInt(id);
    
          if (isNaN(userId)) {
            return res.status(400).json({ message: 'Invalid user ID' });
          }
    
          const user = await this.userRepo.getUserById(userId);
    
          if (!user) {
            return res.status(404).json({ message: 'User not found' });
          }
    
          const response: any = {
            id: user.id,
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
            admin: user.admin,
            createdAt: user.createdAt,
            updatedAt: user.updatedAt,
          };
    
          return res.status(200).json(response);
        } catch (error: any) {
          console.error('Get user error:', error);
          return res.status(500).json({ message: 'Internal server error' });
        }
    }

    async delete(req: AuthRequest, res: Response) {
        try {
          const { id } = req.params as { id: string };
    
          if (!id) {
            return res.status(400).json({ message: 'User ID is required' });
          }
    
          const userId = parseInt(id);
    
          if (isNaN(userId)) {
            return res.status(400).json({ message: 'Invalid user ID' });
          }
    
          if (req.userId !== userId) {
            return res.status(403).json({ message: 'You can only delete your own account' });
          }
    
          const user = await this.userRepo.getUserById(userId);
    
          if (!user) {
            return res.status(404).json({ message: 'User not found' });
          }
    
          await this.userRepo.delete(userId);
    
          return res.status(200).json({ message: 'User deleted successfully' });
        } catch (error: any) {
          console.error('Delete user error:', error);
          return res.status(500).json({ message: 'Internal server error' });
        }
    }

    async promoteSelfToAdmin(req: AuthRequest, res: Response) {
        try {
          const isDev = (process.env.NODE_ENV || 'development') === 'development';
          if (!isDev) {
            return res.status(403).json({ message: 'Admin self-promotion is only available in development' });
          }
    
          if (!req.userId) {
            return res.status(401).json({ message: 'Unauthorized' });
          }
    
          const user = await this.userRepo.getUserById(req.userId);
    
          if (!user) {
            return res.status(404).json({ message: 'User not found' });
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
        } catch (error: any) {
          console.error('Promote user error:', error);
          return res.status(500).json({ message: 'Internal server error' });
        }
    }
}