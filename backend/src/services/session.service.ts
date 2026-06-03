import { Response } from 'express';
import { CreateSessionDto, UpdateSessionDto } from '../dto/session.dto';
import { SessionRepo } from '../repository/session.repo';
import { UserRepo } from '../repository/user.repo';
import { TeacherRepo } from '../repository/teacher.repo';


export class SessionService {
    private sessionRepo = new SessionRepo;
    private userRepo = new UserRepo;
    private teacherRepo = new TeacherRepo;
    
    async getAll(res: Response) {
        try {
          const sessions = await this.sessionRepo.getAll();
    
          const response: any = sessions.map((session: any) => ({
            id: session.id,
            name: session.name,
            date: session.date,
            description: session.description,
            teacher: {
              id: session.teacher.id,
              firstName: session.teacher.firstName,
              lastName: session.teacher.lastName,
            },
            users: session.participants.map((p: any) => p.user.id),
            createdAt: session.createdAt,
            updatedAt: session.updatedAt,
          }));
    
          return res.status(200).json(response);
        } catch (error: any) {
          console.error('Get sessions error:', error);
          return res.status(500).json({ message: 'Internal server error' });
        }
    }

    async getById(id: string, res: Response) {
        try {
          if (!id) {
            return res.status(400).json({ message: 'Session ID is required' });
          }
    
          const sessionId = parseInt(id);
    
          if (isNaN(sessionId)) {
            return res.status(400).json({ message: 'Invalid session ID' });
          }
    
          const session = await this.sessionRepo.getSessionById(sessionId);
    
          if (!session) {
            return res.status(404).json({ message: 'Session not found' });
          }
    
          const response: any = {
            id: session.id,
            name: session.name,
            date: session.date,
            description: session.description,
            teacher: {
              id: session.teacher.id,
              firstName: session.teacher.firstName,
              lastName: session.teacher.lastName,
            },
            users: session.participants.map((p: any) => p.user.id),
            createdAt: session.createdAt,
            updatedAt: session.updatedAt,
          };
    
          return res.status(200).json(response);
        } catch (error: any) {
          console.error('Get session error:', error);
          return res.status(500).json({ message: 'Internal server error' });
        }
    }

    async create(userId: number | undefined,body: CreateSessionDto, res: Response) {
        try {
          const { name, date, description, teacherId } = body;
    
          if (!name) {
            return res.status(400).json({ message: 'Name is required' });
          }
          if (!date) {
            return res.status(400).json({ message: 'Date is required' });
          }
          if (!description) {
            return res.status(400).json({ message: 'Description is required' });
          }
          if (!teacherId) {
            return res.status(400).json({ message: 'Teacher ID is required' });
          }
          if (!userId) {
            return res.status(400).json({ message: 'User ID is required' });
          }
    
          const user = await this.userRepo.getUserById(userId);
    
          if (!user || !user.admin) {
            return res.status(403).json({ message: 'Admin access required' });
          }
    
          const teacher = await this.teacherRepo.getTeacherById(teacherId);
    
          if (!teacher) {
            return res.status(404).json({ message: 'Teacher not found' });
          }
    
          const session = await this.sessionRepo.create({
              name,
              date,
              description,
              teacherId,
            });
    
          const response: any = {
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
        } catch (error: any) {
          console.error('Create session error:', error);
          return res.status(500).json({ message: 'Internal server error' });
        }
    }

    async update(userId: number | undefined, id: string, body: UpdateSessionDto, res: Response) {
        try {
          const { name, date, description, teacherId } = body;
    
          if (!id) {
            return res.status(400).json({ message: 'Session ID is required' });
          }
    
          const sessionId = parseInt(id);
    
          if (isNaN(sessionId)) {
            return res.status(400).json({ message: 'Invalid session ID' });
          }
          if(!userId) {
            return res.status(400).json({ message: 'Invalid user ID' });
          }
          const user = await this.userRepo.getUserById(userId);
    
          if (!user || !user.admin) {
            return res.status(403).json({ message: 'Admin access required' });
          }
    
          const existingSession = await this.sessionRepo.getSessionById(sessionId);
    
          if (!existingSession) {
            return res.status(404).json({ message: 'Session not found' });
          }
    
          const updateData: any = {};
          if (name) updateData.name = name;
          if (date) updateData.date = new Date(date);
          if (description) updateData.description = description;
          if (teacherId) {
            const teacher = await this.teacherRepo.getTeacherById(teacherId);
            if (!teacher) {
              return res.status(404).json({ message: 'Teacher not found' });
            }
            updateData.teacherId = teacherId;
          }
    
          const session = await this.sessionRepo.update(updateData,sessionId);
    
          const response: any = {
            id: session.id,
            name: session.name,
            date: session.date,
            description: session.description,
            teacher: {
              id: session.teacher.id,
              firstName: session.teacher.firstName,
              lastName: session.teacher.lastName,
            },
            users: session.participants.map((p: any) => p.user.id),
            createdAt: session.createdAt,
            updatedAt: session.updatedAt,
          };
    
          return res.status(200).json(response);
        } catch (error: any) {
          console.error('Update session error:', error);
          return res.status(500).json({ message: 'Internal server error' });
        }
    }

    async delete(userId: number | undefined, id: string, res: Response) {
        try {
          if (!id) {
            return res.status(400).json({ message: 'Session ID is required' });
          }
    
          const sessionId = parseInt(id);
    
          if (isNaN(sessionId)) {
            return res.status(400).json({ message: 'Invalid session ID' });
          }
          if(!userId){
            return res.status(400).json({ message: 'Invalid userId ID' });
          }
    
          const user = await this.userRepo.getUserById(userId);
    
          if (!user || !user.admin) {
            return res.status(403).json({ message: 'Admin access required' });
          }
    
          const existingSession = await this.sessionRepo.getSessionById(sessionId);
    
          if (!existingSession) {
            return res.status(404).json({ message: 'Session not found' });
          }
    
          await this.sessionRepo.delete(sessionId);
    
          return res.status(200).json({ message: 'Session deleted successfully' });
        } catch (error: any) {
          console.error('Delete session error:', error);
          return res.status(500).json({ message: 'Internal server error' });
        }
    }

    async participate(userId: string, id: string, res: Response) {
        try {
          if (!id) {
            return res.status(400).json({ message: 'Session ID is required' });
          }
          if (!userId) {
            return res.status(400).json({ message: 'User ID is required' });
          }
    
          const sessionId = parseInt(id);
          const participantUserId = parseInt(userId);
    
          if (isNaN(sessionId)) {
            return res.status(400).json({ message: 'Invalid session ID' });
          }
          if (isNaN(participantUserId)) {
            return res.status(400).json({ message: 'Invalid user ID' });
          }
    
          const session = await this.sessionRepo.getSessionById(sessionId);
    
          if (!session) {
            return res.status(404).json({ message: 'Session not found' });
          }
    
          const user = this.userRepo.getUserById(participantUserId);
    
          if (!user) {
            return res.status(404).json({ message: 'User not found' });
          }
    
          const existingParticipation = await this.sessionRepo.getSessionParticipation(sessionId,participantUserId);
    
          if (existingParticipation) {
            return res.status(400).json({ message: 'User already participating in this session' });
          }
    
          await this.sessionRepo.createSessionParticipation(sessionId,participantUserId);
    
          return res.status(200).json({ message: 'Successfully joined the session' });
        } catch (error: any) {
          console.error('Participate error:', error);
          return res.status(500).json({ message: 'Internal server error' });
        }
    }

    async unparticipate(userId: string, id: string, res: Response) {
        try {
          if (!id) {
            return res.status(400).json({ message: 'Session ID is required' });
          }
          if (!userId) {
            return res.status(400).json({ message: 'User ID is required' });
          }
    
          const sessionId = parseInt(id);
          const participantUserId = parseInt(userId);
    
          if (isNaN(sessionId)) {
            return res.status(400).json({ message: 'Invalid session ID' });
          }
          if (isNaN(participantUserId)) {
            return res.status(400).json({ message: 'Invalid user ID' });
          }
    
          const participation = await this.sessionRepo.getSessionParticipation(sessionId,participantUserId);
    
          if (!participation) {
            return res.status(404).json({ message: 'Participation not found' });
          }
    
          await this.sessionRepo.deleteSessionParticipation(sessionId,participantUserId);
    
          return res.status(200).json({ message: 'Successfully left the session' });
        } catch (error: any) {
          console.error('Unparticipate error:', error);
          return res.status(500).json({ message: 'Internal server error' });
        }
    }
}