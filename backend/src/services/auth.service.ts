import { Response } from 'express';
import { generateToken } from '../utils/jwt.util';
import * as bcrypt from 'bcrypt';
import { LoginDto, RegisterDto } from '../dto/auth.dto';
import { UserRepo } from '../repository/user.repo';
import { UserResponseDto } from '../dto/user.dto';


export class AuthService {
    private userRepo = new UserRepo;

    async login(body: LoginDto, res: Response) {
        const { email, password } = body;
        if (!email) {
            throw({ status: 400, message: 'Email is required' });
        }
        if (!password) {
            throw({ status: 400, message: 'Password is required' });
        }
        if (typeof email !== 'string') {
            throw({ status: 400, message: 'Email must be a string' });
        }
        if (typeof password !== 'string') {
            throw({ status: 400, message: 'Password must be a string' });
        }
    
        const user = await this.userRepo.findUser(email);
    
        if (!user) {
            throw({ status: 401, message: 'Invalid credentials' });
        }
    
        const isPasswordValid = await bcrypt.compare(password, user.password);
    
        if (!isPasswordValid) {
            throw({ status: 401, message: 'Invalid credentials' });
        }
    
        const token = generateToken(user.id);
    
        const response: UserResponseDto = {
            id: user.id,
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
            admin: user.admin,
            token,
        };
    
        return res.status(200).json(response);
    }

    async register(body: RegisterDto, res: Response) {
        const { email, password, firstName, lastName } = body;

        if (!email) {
            throw({ status: 400, message: 'Email is required' });
        }
        if (!password) {
            throw({ status: 400, message: 'Password is required' });
        }
        if (!firstName) {
            throw({ status: 400, message: 'First name is required' });
        }
        if (!lastName) {
            throw({ status: 400, message: 'Last name is required' });
        }
        if (password.length < 8) {
            throw({ status: 400, message: 'Password must be at least 8 characters' });
        }

        const existingUser = await this.userRepo.findUser(email);

        if (existingUser) {
            throw({ status: 400, message: 'Email already exists' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const user = await this.userRepo.createUser({
            email,
            password: hashedPassword,
            firstName,
            lastName,
            admin: false,
        },)

        const token = generateToken(user.id);

        const response: UserResponseDto = {
            id: user.id,
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
            admin: user.admin,
            token,
        };

        return res.status(201).json(response);
    }
}