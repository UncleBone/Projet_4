import { Response } from 'express';
import { generateToken } from '../utils/jwt.util';
import * as bcrypt from 'bcrypt';
import { LoginDto, RegisterDto } from '../dto/auth.dto';
import { UserRepo } from '../repository/user.repo';


export class AuthService {
    private userRepo = new UserRepo;

    async login(body: LoginDto, res: Response) {
        const { email, password } = body;
        try {
            if (!email) {
            return res.status(400).json({ message: 'Email is required' });
            }
            if (!password) {
            return res.status(400).json({ message: 'Password is required' });
            }
            if (typeof email !== 'string') {
            return res.status(400).json({ message: 'Email must be a string' });
            }
            if (typeof password !== 'string') {
            return res.status(400).json({ message: 'Password must be a string' });
            }
    
            const user = await this.userRepo.findUser(email);
    
            if (!user) {
            return res.status(401).json({ message: 'Invalid credentials' });
            }
    
            const isPasswordValid = await bcrypt.compare(password, user.password);
    
            if (!isPasswordValid) {
            return res.status(401).json({ message: 'Invalid credentials' });
            }
    
            const token = generateToken(user.id);
    
            const response: any = {
                id: user.id,
                email: user.email,
                firstName: user.firstName,
                lastName: user.lastName,
                admin: user.admin,
                token,
            };
    
            return res.status(200).json(response);
        } catch (error: any) {
            console.error('Login error:', error);
            return res.status(500).json({ message: 'Internal server error' });
        }
    }

    async register(body: RegisterDto, res: Response) {
        try {
            const { email, password, firstName, lastName } = body;

            if (!email) {
                return res.status(400).json({ message: 'Email is required' });
            }
            if (!password) {
                return res.status(400).json({ message: 'Password is required' });
            }
            if (!firstName) {
                return res.status(400).json({ message: 'First name is required' });
            }
            if (!lastName) {
                return res.status(400).json({ message: 'Last name is required' });
            }
            if (password.length < 8) {
                return res.status(400).json({ message: 'Password must be at least 8 characters' });
            }

            const existingUser = await this.userRepo.findUser(email);

            if (existingUser) {
                return res.status(400).json({ message: 'Email already exists' });
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

            const response: any = {
                id: user.id,
                email: user.email,
                firstName: user.firstName,
                lastName: user.lastName,
                admin: user.admin,
                token,
            };

            return res.status(201).json(response);
        } catch (error: any) {
            console.error('Register error:', error);
            return res.status(500).json({ message: 'Internal server error' });
        }
    }
}