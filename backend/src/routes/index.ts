import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller';
import { SessionController } from '../controllers/session.controller';
import { TeacherController } from '../controllers/teacher.controller';
import { UserController } from '../controllers/user.controller';
import { authMiddleware } from '../middleware/auth.middleware';
import { NextFunction } from 'express-serve-static-core';
import { Request, Response } from 'express';

const router = Router();
const asyncHandler = require('express-async-handler');

// Controllers
const authController = new AuthController();
const sessionController = new SessionController();
const teacherController = new TeacherController();
const userController = new UserController();

// Auth routes (public)
router.post('/api/auth/login', asyncHandler(
  async (req: Request, res: Response) => authController.login(req, res))
);
router.post('/api/auth/register', asyncHandler(
  async (req: Request, res: Response) => authController.register(req, res))
);

// Session routes (protected)
router.get('/api/session', authMiddleware, asyncHandler(
  async (req: Request, res: Response) => sessionController.getAll(req, res))
);
router.get('/api/session/:id', authMiddleware, asyncHandler(
  async (req: Request, res: Response) => sessionController.getById(req, res))
);
router.post('/api/session', authMiddleware, asyncHandler(
  async (req: Request, res: Response) => sessionController.create(req, res))
);
router.put('/api/session/:id', authMiddleware, asyncHandler(
  async (req: Request, res: Response) => sessionController.update(req, res))
);
router.delete('/api/session/:id', authMiddleware, asyncHandler(
  async (req: Request, res: Response) => sessionController.delete(req, res))
);
router.post('/api/session/:id/participate/:userId', authMiddleware, asyncHandler(
  async (req: Request, res: Response) => sessionController.participate(req, res))
);
router.delete('/api/session/:id/participate/:userId', authMiddleware, asyncHandler(
  async (req: Request, res: Response) => sessionController.unparticipate(req, res))
);

// Teacher routes (protected)
router.get('/api/teacher', authMiddleware, asyncHandler(
  async (req: Request, res: Response) => teacherController.getAll(req, res))
);
router.get('/api/teacher/:id', authMiddleware, asyncHandler(
  async (req: Request, res: Response) => teacherController.getById(req, res))
);

// User routes (protected)
router.get('/api/user/:id', authMiddleware, asyncHandler(
  async (req: Request, res: Response) => userController.getById(req, res))
);
router.post('/api/user/promote-admin', authMiddleware, asyncHandler(
  async (req: Request, res: Response) => userController.promoteSelfToAdmin(req, res))
);
router.delete('/api/user/:id', authMiddleware, asyncHandler(
  async (req: Request, res: Response) => userController.delete(req, res))
);

export default router;
