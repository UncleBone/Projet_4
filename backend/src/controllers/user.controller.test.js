import { UserController } from './user.controller'

const cont = new UserController;

describe('user controller', () => {
    it('getById should call service.getById', async () => {
        const mockGetById = vi.spyOn(cont['userService'],'getById').mockResolvedValue("result")

        const result = await cont.getById("req","res");
        
        expect(mockGetById).toHaveBeenCalledWith("req","res")
        expect(result).toBe("result")
    })

    it('delete should call service.delete', async () => {
        const mockDelete = vi.spyOn(cont['userService'],'delete').mockResolvedValue("result")

        const result = await cont.delete("req","res");
        
        expect(mockDelete).toHaveBeenCalledWith("req","res")
        expect(result).toBe("result")
    })

    it('promoteSelfToAdmin should call service.promoteSelfToAdmin', async () => {
        const mockPromote = vi.spyOn(cont['userService'],'promoteSelfToAdmin').mockResolvedValue("result")

        const result = await cont.promoteSelfToAdmin("req","res");
        
        expect(mockPromote).toHaveBeenCalledWith("req","res")
        expect(result).toBe("result")
    })
})