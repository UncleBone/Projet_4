import { SessionController } from './session.controller'

const cont = new SessionController;

describe('session controller', () => {
    it('getAll should call corresponding service', async () => {
        const mockGetAll = vi.spyOn(cont['sessionService'],'getAll').mockResolvedValue("result")

        const result = await cont.getAll("req","res");
        
        expect(mockGetAll).toHaveBeenCalledWith("res")
        expect(result).toBe("result")
    })

    it('getById should call corresponding service', async () => {
        const mockGetById = vi.spyOn(cont['sessionService'],'getById').mockResolvedValue("result")

        const result = await cont.getById({ params: { id: 1 }},"res");
        
        expect(mockGetById).toHaveBeenCalledWith(1,"res")
        expect(result).toBe("result")
    })

    it('create should call corresponding service', async () => {
        const mockCreate = vi.spyOn(cont['sessionService'],'create').mockResolvedValue("result")

        const result = await cont.create({ userId: 1, body: "body"},"res");
        
        expect(mockCreate).toHaveBeenCalledWith(1,"body","res")
        expect(result).toBe("result")
    })

    it('update should call corresponding service', async () => {
        const mockUpdate = vi.spyOn(cont['sessionService'],'update').mockResolvedValue("result")

        const result = await cont.update({ params: { id: 2 }, userId: 1, body: "body"},"res");
        
        expect(mockUpdate).toHaveBeenCalledWith(1, 2, "body","res")
        expect(result).toBe("result")
    })

    it('delete should call corresponding service', async () => {
        const mockDelete = vi.spyOn(cont['sessionService'],'delete').mockResolvedValue("result")

        const result = await cont.delete({ params: { id: 2 }, userId: 1 },"res");
        
        expect(mockDelete).toHaveBeenCalledWith(1, 2,"res")
        expect(result).toBe("result")
    })

    it('participate should call corresponding service', async () => {
        const mockParticipate = vi.spyOn(cont['sessionService'],'participate').mockResolvedValue("result")

        const result = await cont.participate({ params: { id: 2, userId: 1 } },"res");
        
        expect(mockParticipate).toHaveBeenCalledWith(1, 2,"res")
        expect(result).toBe("result")
    })

    it('unparticipate should call corresponding service', async () => {
        const mockUnparticipate = vi.spyOn(cont['sessionService'],'unparticipate').mockResolvedValue("result")

        const result = await cont.unparticipate({ params: { id: 2, userId: 1 } },"res");
        
        expect(mockUnparticipate).toHaveBeenCalledWith(1, 2,"res")
        expect(result).toBe("result")
    })
})