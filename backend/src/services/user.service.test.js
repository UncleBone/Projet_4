import { UserService } from './user.service'
import { UserRepo } from '../repository/user.repo';
import { faker } from '@faker-js/faker';

const ser = new UserService;

const fakeUser = {
    id: faker.number.int(),
    email: faker.internet.email(),
    firstName: faker.person.firstName(),
    lastName: faker.person.lastName(),
    admin: false,
    createdAt: faker.date.past(),
    updatedAt: faker.date.recent(),
}
const fakeUserWithPassword = { ...fakeUser, password: faker.internet.password() };
const originalEnv = process.env.NODE_ENV;

beforeEach(() => {
    process.env.NODE_ENV = 'development';
})

afterEach(() => {
    process.env.NODE_ENV = originalEnv;
})

describe('user service', () => {
    
    it('getById should throw error if no id', async () => {
        await expect(
            ser.getById({ params: { id: undefined } })
        ).rejects.toEqual({ status: 400, message: 'User ID is required' });
    })

    it('getById should throw error if id is NaN', async () => {
        await expect(
            ser.getById({ params: { id: 'abc' } })
        ).rejects.toEqual({ status: 400, message: 'Invalid user ID' });
    })

    it('getById should throw error if user not found', async () => {
        vi.spyOn(UserRepo.prototype, 'getUserById').mockResolvedValue(undefined);
        await expect(
            ser.getById({ params: { id: 3 } })
        ).rejects.toEqual({ status: 404, message: 'User not found' });
    })

    it('getById should return user info without password', async () => {
        vi.spyOn(UserRepo.prototype, 'getUserById').mockResolvedValue(fakeUserWithPassword);

        const mockReq = { params: { id: fakeUser.id.toString() } };

        const mockRes = {
            status: vi.fn().mockReturnThis(), // pour chaînage .json()
            json: vi.fn(),
        };

        await ser.getById(mockReq, mockRes);

        expect(mockRes.status).toHaveBeenCalledWith(200);
        expect(mockRes.json).toHaveBeenCalledWith(fakeUser);
    })

    it('delete should throw error if no id', async () => {
        await expect(
            ser.delete({ params: { id: undefined } })
        ).rejects.toEqual({ status: 400, message: 'User ID is required' });
    })

    it('delete should throw error if id is NaN', async () => {
        await expect(
            ser.delete({ params: { id: 'abc' } })
        ).rejects.toEqual({ status: 400, message: 'Invalid user ID' });
    })

    it('delete should throw error if id is not userId', async () => {
        await expect(
            ser.delete({ params: { id: 1 }, userId: 2 })
        ).rejects.toEqual({ status: 403, message: 'You can only delete your own account' });
    })

    it('delete should throw error if user not found', async () => {
        vi.spyOn(UserRepo.prototype, 'getUserById').mockResolvedValue(undefined);

        await expect(
            ser.delete({ params: { id: 1 }, userId: 1 })
        ).rejects.toEqual({ status: 404, message: 'User not found' });
    })

    it('delete should delete user and return success response', async () => {
        vi.spyOn(UserRepo.prototype, 'getUserById').mockResolvedValue(fakeUserWithPassword);
        const mockDelete = vi.spyOn(UserRepo.prototype, 'delete').mockResolvedValue(undefined);

        const mockReq = { params: { id: fakeUser.id }, userId: fakeUser.id };

        const mockRes = {
            status: vi.fn().mockReturnThis(), // pour chaînage .json()
            json: vi.fn(),
        };

        await ser.delete(mockReq, mockRes);

        expect(mockDelete).toHaveBeenCalledWith(fakeUser.id);
        expect(mockRes.status).toHaveBeenCalledWith(200);
        expect(mockRes.json).toHaveBeenCalledWith({ message: 'User deleted successfully' });
    })

    it('promoteSelfToAdmin should throw error if not in dev mode', async () => {
        process.env.NODE_ENV = 'not_development';
        
        await expect(
            ser.promoteSelfToAdmin({ params: { id: 1 } })
        ).rejects.toEqual({ status: 403, message: 'Admin self-promotion is only available in development' });
    })

    it('promoteSelfToAdmin should throw error if no userId', async () => {
        await expect(
            ser.promoteSelfToAdmin({ params: { id: 1 }, userId: undefined })
        ).rejects.toEqual({ status: 401, message: 'Unauthorized' });
    })

    it('promoteSelfToAdmin should throw error if user not found', async () => {
        vi.spyOn(UserRepo.prototype, 'getUserById').mockResolvedValue(undefined);

        await expect(
            ser.promoteSelfToAdmin({ params: { id: 1 }, userId: 1 })
        ).rejects.toEqual({ status: 404, message: 'User not found' });
    })

    it('promoteSelfToAdmin should return admin user', async () => {
        vi.spyOn(UserRepo.prototype, 'getUserById').mockResolvedValue(fakeUser);
        const mockPromote = vi.spyOn(UserRepo.prototype, 'promote').mockResolvedValue({...fakeUser, admin: true });

        const mockReq = { params: { id: fakeUser.id }, userId: fakeUser.id };

        const mockRes = {
            status: vi.fn().mockReturnThis(), // pour chaînage .json()
            json: vi.fn(),
        };

        await ser.promoteSelfToAdmin(mockReq, mockRes);

        expect(mockPromote).toHaveBeenCalledWith(fakeUser.id);
        expect(mockRes.status).toHaveBeenCalledWith(200);
        expect(mockRes.json).toHaveBeenCalledWith({...fakeUser, admin: true });
    })
})