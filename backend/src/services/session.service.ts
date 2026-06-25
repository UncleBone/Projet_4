import { Response } from 'express';
import { CreateSessionDto, SessionResponseDto, SessionWithTeacherAndParticipants, UpdateSessionDto } from '../dto/session.dto';
import { SessionRepo } from '../repository/session.repo';
import { UserRepo } from '../repository/user.repo';
import { TeacherRepo } from '../repository/teacher.repo';
import { User } from '@prisma/client';


export class SessionService {
    private sessionRepo = new SessionRepo;
    private userRepo = new UserRepo;
    private teacherRepo = new TeacherRepo;
    
    async getAll(res: Response) {
      const sessions = await this.sessionRepo.getAll();

      const response: Array<SessionResponseDto> = sessions.map((session: SessionWithTeacherAndParticipants) => ({
        id: session.id,
        name: session.name,
        date: session.date,
        description: session.description,
        teacher: {
          id: session.teacher.id,
          firstName: session.teacher.firstName,
          lastName: session.teacher.lastName,
        },
        users: session.participants.map((p: { user: User }) => p.user.id),
        createdAt: session.createdAt,
        updatedAt: session.updatedAt,
      }));

      return res.status(200).json(response);
    }

    async getById(id: string, res: Response) {
      if (!id) {
        throw({ status: 400, message: 'Session ID is required' });
      }

      const sessionId = parseInt(id);

      if (isNaN(sessionId)) {
        throw({ status: 400, message: 'Invalid session ID' });
      }

      const session = await this.sessionRepo.getSessionById(sessionId);

      if (!session) {
        throw({ status: 404, message: 'Session not found' });
      }

      const response: SessionResponseDto = {
        id: session.id,
        name: session.name,
        date: session.date,
        description: session.description,
        teacher: {
          id: session.teacher.id,
          firstName: session.teacher.firstName,
          lastName: session.teacher.lastName,
        },
        users: session.participants.map((p: { user: User }) => p.user.id),
        createdAt: session.createdAt,
        updatedAt: session.updatedAt,
      };

      return res.status(200).json(response);
    }

    async create(userId: number | undefined, body: CreateSessionDto, res: Response) {
      const { name, date, description, teacherId } = body;

      if (!name) {
        throw({ status: 400, message: 'Name is required' });
      }
      if (!date) {
        throw({ status: 400, message: 'Date is required' });
      }
      if (!description) {
        throw({ status: 400, message: 'Description is required' });
      }
      if (!teacherId) {
        throw({ status: 400, message: 'Teacher ID is required' });
      }
      if (!userId) {
        throw({ status: 400, message: 'User ID is required' });
      }

      const user = await this.userRepo.getUserById(userId);

      if (!user || !user.admin) {
        throw({ status: 403, message: 'Admin access required' });
      }

      const teacher = await this.teacherRepo.getTeacherById(teacherId);

      if (!teacher) {
        throw({ status: 404, message: 'Teacher not found' });
      }

      const session = await this.sessionRepo.create({
          name,
          date,
          description,
          teacherId,
        });

      const response: SessionResponseDto = {
        id: session.id,
        name: session.name,
        date: session.date,
        description: session.description,
        teacher: {
          id: session.teacher.id,
          firstName: session.teacher.firstName,
          lastName: session.teacher.lastName,
        },
        users: [],
        createdAt: session.createdAt,
        updatedAt: session.updatedAt,
      };

      return res.status(201).json(response);
    }

    async update(userId: number | undefined, id: string, body: UpdateSessionDto, res: Response) {
      const { name, date, description, teacherId } = body;

      if (!id) {
        throw({ status: 400, message: 'Session ID is required' });
      }

      const sessionId = parseInt(id);

      if (isNaN(sessionId)) {
        throw({ status: 400, message: 'Invalid session ID' });
      }
      if(!userId) {
        throw({ status: 400, message: 'Invalid user ID' });
      }
      const user = await this.userRepo.getUserById(userId);

      if (!user || !user.admin) {
        throw({ status: 403, message: 'Admin access required' });
      }

      const existingSession = await this.sessionRepo.getSessionById(sessionId);

      if (!existingSession) {
        throw({ status: 404, message: 'Session not found' });
      }

      const updateData: any = {};
      if (name) updateData.name = name;
      if (date) updateData.date = new Date(date);
      if (description) updateData.description = description;
      if (teacherId) {
        const teacher = await this.teacherRepo.getTeacherById(teacherId);
        if (!teacher) {
          throw({ status: 404, message: 'Teacher not found' });
        }
        updateData.teacherId = teacherId;
      }

      const session = await this.sessionRepo.update(updateData,sessionId);

      const response: SessionResponseDto = {
        id: session.id,
        name: session.name,
        date: session.date,
        description: session.description,
        teacher: {
          id: session.teacher.id,
          firstName: session.teacher.firstName,
          lastName: session.teacher.lastName,
        },
        users: session.participants.map((p: { user: User }) => p.user.id),
        createdAt: session.createdAt,
        updatedAt: session.updatedAt,
      };

      return res.status(200).json(response);
    }

    async delete(userId: number | undefined, id: string, res: Response) {
      if (!id) {
        throw({ status: 400, message: 'Session ID is required' });
      }

      const sessionId = parseInt(id);

      if (isNaN(sessionId)) {
        throw({ status: 400, message: 'Invalid session ID' });
      }
      if(!userId){
        throw({ status: 400, message: 'Invalid user ID' });
      }

      const user = await this.userRepo.getUserById(userId);

      if (!user || !user.admin) {
        throw({ status: 403, message: 'Admin access required' });
      }

      const existingSession = await this.sessionRepo.getSessionById(sessionId);

      if (!existingSession) {
        throw({ status: 404, message: 'Session not found' });
      }

      await this.sessionRepo.delete(sessionId);

      return res.status(200).json({ message: 'Session deleted successfully' });
    }

    async participate(userId: string, id: string, res: Response) {
      if (!id) {
        throw({ status: 400, message: 'Session ID is required' });
      }
      if (!userId) {
        throw({ status: 400, message: 'User ID is required' });
      }

      const sessionId = parseInt(id);
      const participantUserId = parseInt(userId);

      if (isNaN(sessionId)) {
        throw({ status: 400, message: 'Invalid session ID' });
      }
      if (isNaN(participantUserId)) {
        throw({ status: 400, message: 'Invalid user ID' });
      }

      const session = await this.sessionRepo.getSessionById(sessionId);

      if (!session) {
        throw({ status: 404, message: 'Session not found' });
      }
      const user = await this.userRepo.getUserById(participantUserId);

      if (!user) {
        throw({ status: 404, message: 'User not found' });
      }

      const existingParticipation = await this.sessionRepo.getSessionParticipation(sessionId,participantUserId);

      if (existingParticipation) {
        throw({ status: 400, message: 'User already participating in this session' });
      }

      await this.sessionRepo.createSessionParticipation(sessionId,participantUserId);

      return res.status(200).json({ message: 'Successfully joined the session' });
    }

    async unparticipate(userId: string, id: string, res: Response) {
      if (!id) {
        throw({ status: 400, message: 'Session ID is required' });
      }
      if (!userId) {
        throw({ status: 400, message: 'User ID is required' });
      }

      const sessionId = parseInt(id);
      const participantUserId = parseInt(userId);

      if (isNaN(sessionId)) {
        throw({ status: 400, message: 'Invalid session ID' });
      }
      if (isNaN(participantUserId)) {
        throw({ status: 400, message: 'Invalid user ID' });
      }

      const participation = await this.sessionRepo.getSessionParticipation(sessionId,participantUserId);

      if (!participation) {
        throw({ status: 404, message: 'Participation not found' });
      }

      await this.sessionRepo.deleteSessionParticipation(sessionId,participantUserId);

      return res.status(200).json({ message: 'Successfully left the session' });
    }
}