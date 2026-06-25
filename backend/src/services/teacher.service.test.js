import { TeacherService } from './teacher.service'
import { TeacherRepo } from '../repository/teacher.repo';
import { faker } from '@faker-js/faker';

const ser = new TeacherService;

const teachers = [
    { id: 1, firstName: faker.person.firstName(), lastName: faker.person.lastName(), createdAt: faker.date.past(), updatedAt: faker.date.recent() },
    { id: 2, firstName: faker.person.firstName(), lastName: faker.person.lastName(), createdAt: faker.date.past(), updatedAt: faker.date.recent() },
]

describe('teacher service', () => {
    
    it('getAll should return teachers', async () => {
        vi.spyOn(TeacherRepo.prototype, 'getAll').mockResolvedValue(teachers);

        const mockRes = {
            status: vi.fn().mockReturnThis(), // pour chaînage .json()
            json: vi.fn(),
        };

        await ser.getAll(mockRes);

        expect(mockRes.status).toHaveBeenCalledWith(200);
        expect(mockRes.json).toHaveBeenCalledWith(teachers);
    })

    it('getById should throw error if no id', async () => {
        await expect(
            ser.getById(undefined)
        ).rejects.toEqual({ status: 400, message: 'Teacher ID is required' });
    })

    it('getById should throw error if id is NaN', async () => {
        await expect(
            ser.getById('abc')
        ).rejects.toEqual({ status: 400, message: 'Invalid teacher ID' });
    })

    it('getById should throw error if user not found', async () => {
        vi.spyOn(TeacherRepo.prototype, 'getTeacherById').mockResolvedValue(undefined);

        await expect(
            ser.getById(1)
        ).rejects.toEqual({ status: 404, message: 'Teacher not found' });
    })

    it('getById should return user info without password', async () => {
        vi.spyOn(TeacherRepo.prototype, 'getTeacherById').mockResolvedValue(teachers[0]);

        const mockRes = {
            status: vi.fn().mockReturnThis(), // pour chaînage .json()
            json: vi.fn(),
        };

        await ser.getById(1, mockRes);

        expect(mockRes.status).toHaveBeenCalledWith(200);
        expect(mockRes.json).toHaveBeenCalledWith(teachers[0]);
    })

})