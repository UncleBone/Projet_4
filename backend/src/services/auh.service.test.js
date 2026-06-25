import { AuthService } from "./auth.service";
import { generateToken } from '../utils/jwt.util';
import { UserRepo } from "../repository/user.repo";
import * as bcrypt from 'bcrypt';
import { faker } from '@faker-js/faker';

const ser = new AuthService;

const fakeUser = {
    id: faker.number.int(),
    email: faker.internet.email(),
    firstName: faker.person.firstName(),
    lastName: faker.person.lastName(),
}
const fakeUserWithPassword = { ...fakeUser, password: faker.internet.password() };

vi.mock(import("bcrypt"), async (importOriginal) => {
  const actual = await importOriginal()
  return {
    ...actual,
  compare: vi.fn(),
  }
})

describe('auth service', () => {
    it('login should return error if email is missing', async () => {
        await expect(
            ser.login({ })
        ).rejects.toEqual({ status: 400, message: 'Email is required' });
    })

    it('login should return error if password is missing', async () => {
        await expect(
            ser.login({ email: fakeUser.email })
        ).rejects.toEqual({ status: 400, message: 'Password is required' });
    })

    it('login should return error if email is not string', async () => {
        await expect(
            ser.login({ email: 123, password: fakeUserWithPassword.password })
        ).rejects.toEqual({ status: 400, message: 'Email must be a string' });
    })

    it('login should return error if password is not string', async () => {
        await expect(
            ser.login({ email: fakeUser.email, password: true })
        ).rejects.toEqual({ status: 400, message: 'Password must be a string' });
    })

    it('login should return error if user is not found', async () => {
        vi.spyOn(UserRepo.prototype, 'findUser').mockResolvedValue(undefined);
        
        await expect(
            ser.login({ email: fakeUser.email, password: fakeUserWithPassword.password })
        ).rejects.toEqual({ status: 401, message: 'Invalid credentials' });
    })

    it('login should return error if wrong password', async () => {
        vi.spyOn(UserRepo.prototype, 'findUser').mockResolvedValue(fakeUser);
        bcrypt.compare.mockResolvedValue(false);
        
        await expect(
            ser.login({ email: fakeUser.email, password: fakeUserWithPassword.password })
        ).rejects.toEqual({ status: 401, message: 'Invalid credentials' });
    })

    it('login should return user with token', async () => {
        vi.spyOn(UserRepo.prototype, 'findUser').mockResolvedValue(fakeUser);
        bcrypt.compare.mockResolvedValue(true);
        
        const token = generateToken(fakeUser.id)

        const mockRes = {
            status: vi.fn().mockReturnThis(), // pour chaînage .json()
            json: vi.fn(),
        };

        await ser.login({ email: fakeUser.email, password: fakeUserWithPassword.password }, mockRes);

        expect(mockRes.status).toHaveBeenCalledWith(200);
        expect(mockRes.json).toHaveBeenCalledWith({...fakeUser, token });
    })

    it('register should return error if email is missing', async () => {
        await expect(
            ser.register({...fakeUserWithPassword, email: undefined })
        ).rejects.toEqual({ status: 400, message: 'Email is required' });
    })

    it('register should return error if password is missing', async () => {
        await expect(
            ser.register({...fakeUserWithPassword, password: undefined })
        ).rejects.toEqual({ status: 400, message: 'Password is required' });
    })

    it('register should return error if first name is missing', async () => {
        await expect(
            ser.register({...fakeUserWithPassword, firstName: undefined })
        ).rejects.toEqual({ status: 400, message: 'First name is required' });
    })

    it('register should return error if last name is missing', async () => {
        await expect(
            ser.register({...fakeUserWithPassword, lastName: undefined })
        ).rejects.toEqual({ status: 400, message: 'Last name is required' });
    })

    it('register should return error if password length < 8', async () => {
        await expect(
            ser.register({...fakeUserWithPassword, password: "1234567" })
        ).rejects.toEqual({ status: 400, message: 'Password must be at least 8 characters' });
    })

    it('register should return error if email already exists', async () => {
        vi.spyOn(UserRepo.prototype, 'findUser').mockResolvedValue(fakeUser);
        
        await expect(
            ser.register(fakeUserWithPassword)
        ).rejects.toEqual({ status: 400, message: 'Email already exists' });
    })

    it('register should return user with token', async () => {
        vi.spyOn(UserRepo.prototype, 'findUser').mockResolvedValue(undefined);
        vi.spyOn(UserRepo.prototype, 'createUser').mockResolvedValue({...fakeUserWithPassword, admin: false });
        
        // const hashedPassword = await bcrypt.hash(fakeUserWithPassword.password, 10);
        const token = generateToken(fakeUser.id)

        const mockRes = {
            status: vi.fn().mockReturnThis(), // pour chaînage .json()
            json: vi.fn(),
        };

        await ser.register(fakeUserWithPassword, mockRes);

        expect(mockRes.status).toHaveBeenCalledWith(201);
        expect(mockRes.json).toHaveBeenCalledWith({...fakeUser, token, admin: false });
    })
})
