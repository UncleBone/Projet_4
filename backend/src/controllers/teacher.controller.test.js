import { TeacherController } from './teacher.controller'

const cont = new TeacherController;

describe('teacher controller', () => {
    it('getAll should call corresponding service', async () => {
        const mockGetAll = vi.spyOn(cont['teacherService'],'getAll').mockResolvedValue("result")

        const result = await cont.getAll("req","res");
        
        expect(mockGetAll).toHaveBeenCalledWith("res")
        expect(result).toBe("result")
    })

    it('getById should call corresponding service', async () => {
        const mockGetById = vi.spyOn(cont['teacherService'],'getById').mockResolvedValue("result")

        const result = await cont.getById({ params: { id: 1 }},"res");
        
        expect(mockGetById).toHaveBeenCalledWith(1,"res")
        expect(result).toBe("result")
    })
})