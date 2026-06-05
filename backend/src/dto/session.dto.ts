import { Session, User } from '@prisma/client';
import { z } from 'zod';
import { TeacherResponseDto } from './teacher.dto';

export const CreateSessionSchema = z.object({
  name: z.string().min(3).max(50),
  date: z.string(),
  description: z.string().max(2500),
  teacherId: z.number(),
});

export const UpdateSessionSchema = z.object({
  name: z.string().min(3).max(50).optional(),
  date: z.string().optional(),
  description: z.string().max(2500).optional(),
  teacherId: z.number().optional(),
});

export type CreateSessionDto = z.infer<typeof CreateSessionSchema>;
export type UpdateSessionDto = z.infer<typeof UpdateSessionSchema>;

export type SessionWithTeacherAndParticipants = Omit<Session,"teacherId"> & {
  teacher: TeacherResponseDto,
  participants: Array<{user: User}>
}
export type SessionResponseDto = Omit<SessionWithTeacherAndParticipants,"participants"> & {
  users: Array<number>
}
