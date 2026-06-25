import { AuthController } from './auth.controller'

const cont = new AuthController;

describe('auth controller', () => {
    it('login should call corresponding service', async () => {
        const mockLogin = vi.spyOn(cont['authService'],'login').mockResolvedValue("result")

        const result = await cont.login({ body: "body" },"res");
        
        expect(mockLogin).toHaveBeenCalledWith("body","res")
        expect(result).toBe("result")
    })

    it('register should call corresponding service', async () => {
        const mockRegister = vi.spyOn(cont['authService'],'register').mockResolvedValue("result")

        const result = await cont.register({ body: "body" },"res");
        
        expect(mockRegister).toHaveBeenCalledWith("body","res")
        expect(result).toBe("result")
    })

})