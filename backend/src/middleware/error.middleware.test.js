import { errorHandler } from './error.middleware'

const mockNext = vi.fn();

describe('errorHandler', () => {
    it('should return next(err) if headersSent', async () => {
        mockNext.mockResolvedValue('next output');
        const result = await errorHandler('error', {}, { headersSent: true }, mockNext)

        expect(mockNext).toHaveBeenCalledWith('error');
        expect(result).toBe('next output')
    })

    it('should return response with error status and message', async () => {
        const mockRes = {
            status: vi.fn().mockReturnThis(), // pour chaînage .json()
            send: vi.fn(),
        };
        
        const result = await errorHandler({ status: 400, message: "error" }, {}, mockRes, mockNext)

        expect(mockRes.status).toHaveBeenCalledWith(400);
        expect(mockRes.send).toHaveBeenCalledWith({ message: "error" });
    })

    it('should return default error if error is not specified', async () => {
        const mockRes = {
            status: vi.fn().mockReturnThis(), // pour chaînage .json()
            send: vi.fn(),
        };
        
        const result = await errorHandler({}, {}, mockRes, mockNext)

        expect(mockRes.status).toHaveBeenCalledWith(500);
        expect(mockRes.send).toHaveBeenCalledWith({ message: "Something broke!" });
    })
})