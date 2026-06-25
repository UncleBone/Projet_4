import { faker } from '@faker-js/faker';
import { SessionRepo } from './session.repo';

const mockFindMany = vi.fn();
const mockFindUnique = vi.fn();
const mockCreate = vi.fn();
const mockUpdate = vi.fn();
const mockDelete = vi.fn();
const mockFindUniqueParticipation = vi.fn();
const mockCreateParticipation = vi.fn();
const mockDeleteParticipation = vi.fn();

vi.mock('@prisma/client', () => {
  return {
    PrismaClient: class {
      session = {
        findMany: (param) => mockFindMany(param),
        findUnique: (param) => mockFindUnique(param),
        create: (param) => mockCreate(param),
        update: (param) => mockUpdate(param),
        delete: (param) => mockDelete(param),
      };
      sessionParticipation = {
        findUnique: (param) => mockFindUniqueParticipation(param),
        create: (param) => mockCreateParticipation(param),
        delete: (param) => mockDeleteParticipation(param),
      };
    }
  }
});

const sessions = [
    { id: 1, name: faker.lorem.word(), date: new Date(), description: faker.lorem.paragraph(), teacherId: 1, createdAt: new Date(), updatedAt: new Date() },
    { id: 2, name: faker.lorem.word(), date: new Date(), description: faker.lorem.paragraph(), teacherId: 2, createdAt: new Date(), updatedAt: new Date() },
]


describe('SessionRepo', () => {
  let repo;

  beforeEach(() => {
    repo = new SessionRepo();

    mockFindMany.mockReset();
    mockFindUnique.mockReset();
    mockCreate.mockReset();
    mockUpdate.mockReset();
    mockDelete.mockReset();
    mockFindUniqueParticipation.mockReset();
    mockCreateParticipation.mockReset();
    mockDeleteParticipation.mockReset();
  });

  afterEach(() => { vi.clearAllMocks(); });

  it('getAll should return sessions', async () => {
    mockFindMany.mockResolvedValue(sessions);

    const result = await repo.getAll();
    expect(mockFindMany).toHaveBeenCalledOnce();
    expect(result).toEqual(sessions);
  });
 
  it('getSessionById should return session', async () => {
    mockFindUnique.mockResolvedValue(sessions[0]);

    const result = await repo.getSessionById();
    expect(mockFindUnique).toHaveBeenCalledOnce();
    expect(result).toEqual(sessions[0]);
  });

  it('create should create a session', async () => {
    const input = { name: 'S1', description: 'desc', teacherId: 1, date: '2024-06-01' };
    const created = { id: 10, ...input, date: new Date(input.date), teacher: {}, participants: []};
    mockCreate.mockResolvedValue(created);

    const result = await repo.create(input);
    expect(mockCreate).toHaveBeenCalledWith(expect.objectContaining({
      data: expect.objectContaining({
        name: input.name,
        description: input.description,
        teacherId: input.teacherId,
        date: expect.any(Date)
      }),
      include: expect.anything()
    }));
    expect(result).toEqual(created);
  });

  it('update should update a session', async () => {
    const updateData = { name: 'new name' };
    mockUpdate.mockResolvedValue(sessions[0]);

    const result = await repo.update(updateData,1);
    expect(mockUpdate).toHaveBeenCalledWith(expect.objectContaining({
        where: { id: 1 },
        data: updateData,
        include: expect.anything()
    }));
    expect(result).toEqual(sessions[0]);
  });

  it('delete should delete a session', async () => {
    await repo.delete(1);
    expect(mockDelete).toHaveBeenCalledWith(expect.objectContaining({
        where: { id: 1 }
    }));
  });

  it('getSessionParticipation should return session participation', async () => {
    mockFindUniqueParticipation.mockResolvedValue("participation");
    const result = await repo.getSessionParticipation(1,2);
    expect(mockFindUniqueParticipation).toHaveBeenCalledWith(expect.objectContaining({
        where: { 
            sessionId_userId: {
                sessionId: 1,
                userId: 2
              },
            }
    }));
    expect(result).toEqual("participation");
  });

  it('createSessionParticipation should create session participation', async () => {
    await repo.createSessionParticipation(1,2);
    expect(mockCreateParticipation).toHaveBeenCalledWith(expect.objectContaining({
        data: { 
            sessionId: 1,
            userId: 2
        }
    }));
  });

  it('deleteSessionParticipation should delete session participation', async () => {
    await repo.deleteSessionParticipation(1,2);
    expect(mockDeleteParticipation).toHaveBeenCalledWith(expect.objectContaining({
        where: { 
            sessionId_userId: {
                sessionId: 1,
                userId: 2
              },
            }
    }));
  });

});