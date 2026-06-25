import jwt from 'jsonwebtoken';
import { generateToken, verifyToken } from './jwt.util'

// const JWT_SECRET = process.env.JWT_SECRET || 'default-secret-key';


describe('jwt utils', () => {
    it('generateToken should return token', () => {
        expect(generateToken(10)).toBeTypeOf('string')
    })

    it('verifyToken should return user id who generated token', () => {
        const token = generateToken(10);
        const verify = verifyToken(token)
        expect(verify.userId).toBe(10)
    })

    it('verifyToken of invalid token should return null', () => {
        const token = generateToken(10);
        const verify = verifyToken(token+"abc")
        expect(verify).toBe(null)
    })
})