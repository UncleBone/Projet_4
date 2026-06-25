import { authMiddleware } from './auth.middleware'

const mockNext = vi.fn();
const mockVerify = vi.fn();

vi.mock('../utils/jwt.util', async (importOriginal) => {
  const actual = await importOriginal()
  return {
    ...actual,
    verifyToken: (param) => mockVerify(param),
  }
})

describe('errorHandler', () => {
    it('should return error if no token', async () => {
        const mockRes = {
            status: vi.fn().mockReturnThis(), // pour chaînage .json()
            json: vi.fn(),
        };
        
        const result = await authMiddleware({ headers: { authorization: null }}, mockRes, mockNext)

        expect(mockRes.status).toHaveBeenCalledWith(401);
        expect(mockRes.json).toHaveBeenCalledWith({ message: 'No token provided' });
    })

    it('should return error if wrong token format', async () => {
        const mockRes = {
            status: vi.fn().mockReturnThis(), // pour chaînage .json()
            json: vi.fn(),
        };
        
        const result = await authMiddleware({ headers: { authorization: " " }}, mockRes, mockNext)

        expect(mockRes.status).toHaveBeenCalledWith(401);
        expect(mockRes.json).toHaveBeenCalledWith({ message: 'Invalid token format' });
    })

    it('should return error if invalid token', async () => {
        const mockRes = {
            status: vi.fn().mockReturnThis(), // pour chaînage .json()
            json: vi.fn(),
        };
        mockVerify.mockReturnValue(false)
        
        const result = await authMiddleware({ headers: { authorization: "token 12345" }}, mockRes, mockNext)

        expect(mockVerify).toHaveBeenCalledWith("12345");
        expect(mockRes.status).toHaveBeenCalledWith(401);
        expect(mockRes.json).toHaveBeenCalledWith({ message: 'Invalid or expired token' });
    })

    it('should call next', async () => {
        const mockRes = {
            status: vi.fn().mockReturnThis(), // pour chaînage .json()
            json: vi.fn(),
        };
        mockVerify.mockReturnValue(true)
        
        const result = await authMiddleware({ headers: { authorization: "token 12345" }}, mockRes, mockNext)

        expect(mockNext).toHaveBeenCalled();
    })
})