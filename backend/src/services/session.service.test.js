import { SessionService } from './session.service'
import { SessionRepo } from '../repository/session.repo';
import { UserRepo } from '../repository/user.repo';
import { TeacherRepo } from '../repository/teacher.repo';
import { faker } from '@faker-js/faker';

const ser = new SessionService;

const teachers = [
    { id: 1, firstName: faker.person.firstName(), lastName: faker.person.lastName() },
    { id: 2, firstName: faker.person.firstName(), lastName: faker.person.lastName() },
    { id: 3, firstName: faker.person.firstName(), lastName: faker.person.lastName() },
]
const sessions = [
    { id: 1, name: faker.lorem.word(), date: new Date(), description: faker.lorem.paragraph(), participants: [], teacher : teachers[0], createdAt: new Date(), updatedAt: new Date() },
    { id: 2, name: faker.lorem.word(), date: new Date(), description: faker.lorem.paragraph(), participants: [], teacher : teachers[1], createdAt: new Date(), updatedAt: new Date() },
]
const sessionForm = {
    name: faker.lorem.word(), 
    date: new Date(), 
    description: faker.lorem.paragraph(), 
    teacherId : 3
}
const fakeNewSession = { ...sessionForm, id: 3, users: [], teacher: teachers[2], createdAt: new Date(), updatedAt: new Date() };
const fakeUser = {
    id: faker.number.int(),
    email: faker.internet.email(),
    firstName: faker.person.firstName(),
    lastName: faker.person.lastName(),
    admin: false,
    createdAt: faker.date.past(),
    updatedAt: faker.date.recent(),
}

describe('session service', () => {
    
    it('getAll should return sessions', async () => {
        vi.spyOn(SessionRepo.prototype, 'getAll').mockResolvedValue(sessions);

        const mockRes = {
            status: vi.fn().mockReturnThis(), // pour chaînage .json()
            json: vi.fn(),
        };

        await ser.getAll(mockRes);

        const response = sessions.map((ses) => {
            let res = { ...ses };
            delete res.participants;
            res.users = []
            return res
        })
        expect(mockRes.status).toHaveBeenCalledWith(200);
        expect(mockRes.json).toHaveBeenCalledWith(response);
    })

    it('getById should throw error if no id', async () => {
        await expect(
            ser.getById()
        ).rejects.toEqual({ status: 400, message: 'Session ID is required' });
    })

    it('getById should throw error if id is NaN', async () => {
        await expect(
            ser.getById('abc')
        ).rejects.toEqual({ status: 400, message: 'Invalid session ID' });
    })

    it('getById should throw error if user not found', async () => {
        vi.spyOn(SessionRepo.prototype, 'getSessionById').mockResolvedValue(undefined);

        await expect(
            ser.getById(1)
        ).rejects.toEqual({ status: 404, message: 'Session not found' });
    })

    it('getById should return session', async () => {
        vi.spyOn(SessionRepo.prototype, 'getSessionById').mockResolvedValue(sessions[0]);

        const mockRes = {
            status: vi.fn().mockReturnThis(), // pour chaînage .json()
            json: vi.fn(),
        };

        await ser.getById(1, mockRes);

        const response = { ...sessions[0] };
        delete response.participants;
        response.users = [];
        expect(mockRes.status).toHaveBeenCalledWith(200);
        expect(mockRes.json).toHaveBeenCalledWith(response);
    })

    it('create should return error if name is missing', async () => {
        let body = { ...sessionForm, name: undefined };
        await expect(
            ser.create(1, body)
        ).rejects.toEqual({ status: 400, message: 'Name is required' });
    })

    it('create should return error if date is missing', async () => {
        let body = { ...sessionForm, date: undefined };
        await expect(
            ser.create(1, body)
        ).rejects.toEqual({ status: 400, message: 'Date is required' });
    })

    it('create should return error if description is missing', async () => {
        let body = { ...sessionForm, description: undefined };
        await expect(
            ser.create(1, body)
        ).rejects.toEqual({ status: 400, message: 'Description is required' });
    })

    it('create should return error if teacherId is missing', async () => {
        let body = { ...sessionForm, teacherId: undefined };
        await expect(
            ser.create(1, body)
        ).rejects.toEqual({ status: 400, message: 'Teacher ID is required' });
    })

    it('create should return error if userId is missing', async () => {
        let body = { ...sessionForm };
        await expect(
            ser.create(undefined, body)
        ).rejects.toEqual({ status: 400, message: 'User ID is required' });
    })

    it('create should return error user is not admin', async () => {
        vi.spyOn(UserRepo.prototype, 'getUserById').mockResolvedValue(fakeUser);
        
        const body = { ...sessionForm };
        await expect(
            ser.create(fakeUser.id, body)
        ).rejects.toEqual({ status: 403, message: 'Admin access required' });
    })

    it('create should return error teacher is not found', async () => {
        vi.spyOn(UserRepo.prototype, 'getUserById').mockResolvedValue({...fakeUser, admin: true});
        vi.spyOn(TeacherRepo.prototype, 'getTeacherById').mockResolvedValue(undefined);
        
        const body = { ...sessionForm };
        await expect(
            ser.create(fakeUser.id, body)
        ).rejects.toEqual({ status: 404, message: 'Teacher not found' });
    })

    it('create should create session', async () => {
        vi.spyOn(UserRepo.prototype, 'getUserById').mockResolvedValue({...fakeUser, admin: true});
        vi.spyOn(TeacherRepo.prototype, 'getTeacherById').mockResolvedValue(teachers[2]);
        vi.spyOn(SessionRepo.prototype, 'create').mockResolvedValue({...fakeNewSession, teacher: teachers[2]});
        
        const body = { ...sessionForm };

        const mockRes = {
            status: vi.fn().mockReturnThis(), // pour chaînage .json()
            json: vi.fn(),
        };

        await ser.create(fakeUser.id, body, mockRes);

        let response = { ...fakeNewSession };
        delete response.teacherId;

        expect(mockRes.status).toHaveBeenCalledWith(201);
        expect(mockRes.json).toHaveBeenCalledWith(response);
    })

    it('update should return error if id is missing', async () => {
        let body = { ...sessionForm };
        await expect(
            ser.update(1, undefined, body)
        ).rejects.toEqual({ status: 400, message: 'Session ID is required' });
    })

    it('update should return error if id is NaN', async () => {
        let body = { ...sessionForm };
        await expect(
            ser.update(1, 'abc', body)
        ).rejects.toEqual({ status: 400, message: 'Invalid session ID' });
    })

    it('update should return error if userId is missing', async () => {
        let body = { ...sessionForm };
        await expect(
            ser.update(undefined, 1, body)
        ).rejects.toEqual({ status: 400, message: 'Invalid user ID' });
    })

    it('update should return error user is not admin', async () => {
        vi.spyOn(UserRepo.prototype, 'getUserById').mockResolvedValue(fakeUser);
        
        const body = { ...sessionForm };
        await expect(
            ser.update(fakeUser.id,1, body)
        ).rejects.toEqual({ status: 403, message: 'Admin access required' });
    })

    it('update should return error session is not found', async () => {
        vi.spyOn(UserRepo.prototype, 'getUserById').mockResolvedValue({...fakeUser, admin: true});
        vi.spyOn(SessionRepo.prototype, 'getSessionById').mockResolvedValue(undefined);
        
        const body = { ...sessionForm };
        await expect(
            ser.update(fakeUser.id, 1, body)
        ).rejects.toEqual({ status: 404, message: 'Session not found' });
    })

    it('update should return error teacher is not found', async () => {
        vi.spyOn(UserRepo.prototype, 'getUserById').mockResolvedValue({...fakeUser, admin: true});
        vi.spyOn(SessionRepo.prototype, 'getSessionById').mockResolvedValue(sessions[0]);
        vi.spyOn(TeacherRepo.prototype, 'getTeacherById').mockResolvedValue(undefined);
        
        const body = { ...sessionForm };
        await expect(
            ser.update(fakeUser.id, 1, body)
        ).rejects.toEqual({ status: 404, message: 'Teacher not found' });
    })

    it('should update session', async () => {
        vi.spyOn(UserRepo.prototype, 'getUserById').mockResolvedValue({...fakeUser, admin: true});
        vi.spyOn(SessionRepo.prototype, 'getSessionById').mockResolvedValue(sessions[0]);
        vi.spyOn(TeacherRepo.prototype, 'getTeacherById').mockResolvedValue(teachers[2]);
        vi.spyOn(SessionRepo.prototype, 'update').mockResolvedValue({...fakeNewSession, teacher: teachers[2], participants: []});
        
        const body = { ...sessionForm };

        const mockRes = {
            status: vi.fn().mockReturnThis(), // pour chaînage .json()
            json: vi.fn(),
        };

        await ser.update(fakeUser.id, 1, body, mockRes);

        let response = { ...fakeNewSession };
        delete response.teacherId;

        expect(mockRes.status).toHaveBeenCalledWith(200);
        expect(mockRes.json).toHaveBeenCalledWith(response);
    })

    it('delete should return error if id is missing', async () => {
        await expect(
            ser.delete(1, undefined)
        ).rejects.toEqual({ status: 400, message: 'Session ID is required' });
    })

    it('delete should return error if id is NaN', async () => {
        await expect(
            ser.delete(1, 'abc')
        ).rejects.toEqual({ status: 400, message: 'Invalid session ID' });
    })

    it('delete should return error if userId is missing', async () => {
        await expect(
            ser.delete(undefined, 1)
        ).rejects.toEqual({ status: 400, message: 'Invalid user ID' });
    })

    it('delete should return error if user is not admin', async () => {
        vi.spyOn(UserRepo.prototype, 'getUserById').mockResolvedValue(fakeUser);
        
        await expect(
            ser.delete(fakeUser.id,1)
        ).rejects.toEqual({ status: 403, message: 'Admin access required' });
    })

    it('delete should return error if session is not found', async () => {
        vi.spyOn(UserRepo.prototype, 'getUserById').mockResolvedValue({...fakeUser, admin: true});
        vi.spyOn(SessionRepo.prototype, 'getSessionById').mockResolvedValue(undefined);
        
        await expect(
            ser.delete(fakeUser.id,1)
        ).rejects.toEqual({ status: 404, message: 'Session not found' });
    })

    it('should delete session', async () => {
        vi.spyOn(UserRepo.prototype, 'getUserById').mockResolvedValue({...fakeUser, admin: true});
        vi.spyOn(SessionRepo.prototype, 'getSessionById').mockResolvedValue(sessions[0]);
        vi.spyOn(SessionRepo.prototype, 'delete').mockResolvedValue(undefined);
        
        const mockRes = {
            status: vi.fn().mockReturnThis(), // pour chaînage .json()
            json: vi.fn(),
        };

        await ser.delete(fakeUser.id, 1, mockRes);

        expect(mockRes.status).toHaveBeenCalledWith(200);
        expect(mockRes.json).toHaveBeenCalledWith({ message: 'Session deleted successfully' });
    })

    it('participate should return error if id is missing', async () => {
        await expect(
            ser.participate(1, undefined)
        ).rejects.toEqual({ status: 400, message: 'Session ID is required' });
    })

    it('participate should return error if userId is missing', async () => {
        await expect(
            ser.participate(undefined,1)
        ).rejects.toEqual({ status: 400, message: 'User ID is required' });
    })

    it('participate should return error if id is NaN', async () => {
        await expect(
            ser.participate(1, 'abc')
        ).rejects.toEqual({ status: 400, message: 'Invalid session ID' });
    })

    it('participate should return error if userId is NaN', async () => {
        await expect(
            ser.participate('abc', 1)
        ).rejects.toEqual({ status: 400, message: 'Invalid user ID' });
    })

    it('participate should return error if session is not found', async () => {
        vi.spyOn(SessionRepo.prototype, 'getSessionById').mockResolvedValue(undefined);
        
        await expect(
            ser.participate(1,1)
        ).rejects.toEqual({ status: 404, message: 'Session not found' });
    })

    it('participate should return error if user is not found', async () => {
        vi.spyOn(SessionRepo.prototype, 'getSessionById').mockResolvedValue(sessions[0]);
        vi.spyOn(UserRepo.prototype, 'getUserById').mockResolvedValue(undefined);
        
        await expect(
            ser.participate(1,1)
        ).rejects.toEqual({ status: 404, message: 'User not found' });
    })

    it('participate should return error if user already participate', async () => {
        vi.spyOn(SessionRepo.prototype, 'getSessionById').mockResolvedValue(sessions[0]);
        vi.spyOn(UserRepo.prototype, 'getUserById').mockResolvedValue(fakeUser);
        vi.spyOn(SessionRepo.prototype, 'getSessionParticipation').mockResolvedValue(true);
        
        await expect(
            ser.participate(1,1)
        ).rejects.toEqual({ status: 400, message: 'User already participating in this session' });
    })

    it('participate should add user to session', async () => {
        vi.spyOn(SessionRepo.prototype, 'getSessionById').mockResolvedValue(sessions[0]);
        vi.spyOn(UserRepo.prototype, 'getUserById').mockResolvedValue(fakeUser);
        vi.spyOn(SessionRepo.prototype, 'getSessionParticipation').mockResolvedValue(false);
        vi.spyOn(SessionRepo.prototype, 'createSessionParticipation').mockResolvedValue(undefined);
        
        const mockRes = {
            status: vi.fn().mockReturnThis(), // pour chaînage .json()
            json: vi.fn(),
        };

        await ser.participate(1, 1, mockRes);

        expect(mockRes.status).toHaveBeenCalledWith(200);
        expect(mockRes.json).toHaveBeenCalledWith({ message: 'Successfully joined the session' });
    })

    it('unparticipate should return error if id is missing', async () => {
        await expect(
            ser.unparticipate(1, undefined)
        ).rejects.toEqual({ status: 400, message: 'Session ID is required' });
    })

    it('unparticipate should return error if userId is missing', async () => {
        await expect(
            ser.unparticipate(undefined,1)
        ).rejects.toEqual({ status: 400, message: 'User ID is required' });
    })

    it('unparticipate should return error if id is NaN', async () => {
        await expect(
            ser.unparticipate(1, 'abc')
        ).rejects.toEqual({ status: 400, message: 'Invalid session ID' });
    })

    it('unparticipate should return error if userId is NaN', async () => {
        await expect(
            ser.unparticipate('abc', 1)
        ).rejects.toEqual({ status: 400, message: 'Invalid user ID' });
    })

    it('unparticipate should return error if user dont participate', async () => {
        vi.spyOn(SessionRepo.prototype, 'getSessionById').mockResolvedValue(sessions[0]);
        vi.spyOn(UserRepo.prototype, 'getUserById').mockResolvedValue(fakeUser);
        vi.spyOn(SessionRepo.prototype, 'getSessionParticipation').mockResolvedValue(false);
        
        await expect(
            ser.unparticipate(1,1)
        ).rejects.toEqual({ status: 404, message: 'Participation not found' });
    })

    it('unparticipate should remove user from session', async () => {
        vi.spyOn(SessionRepo.prototype, 'getSessionById').mockResolvedValue(sessions[0]);
        vi.spyOn(UserRepo.prototype, 'getUserById').mockResolvedValue(fakeUser);
        vi.spyOn(SessionRepo.prototype, 'getSessionParticipation').mockResolvedValue(true);
        vi.spyOn(SessionRepo.prototype, 'deleteSessionParticipation').mockResolvedValue(undefined);
        
        const mockRes = {
            status: vi.fn().mockReturnThis(), // pour chaînage .json()
            json: vi.fn(),
        };

        await ser.unparticipate(1, 1, mockRes);

        expect(mockRes.status).toHaveBeenCalledWith(200);
        expect(mockRes.json).toHaveBeenCalledWith({ message: 'Successfully left the session' });
    })

})