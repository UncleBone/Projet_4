import { faker } from '@faker-js/faker';
import { UserRepo } from './user.repo';

const mockFindUnique = vi.fn();
const mockCreate = vi.fn();
const mockDelete = vi.fn();
const mockUpdate = vi.fn();

vi.mock('@prisma/client', () => {
  return {
    PrismaClient: class {
      user = {
        findUnique: (param) => mockFindUnique(param),
        create: (param) => mockCreate(param),
        delete: (param) => mockDelete(param),
        update: (param) => mockUpdate(param),
      };
    }
  }
});

const fakeUser = {
    id: faker.number.int(),
    email: faker.internet.email(),
    firstName: faker.person.firstName(),
    lastName: faker.person.lastName(),
    admin: false,
    createdAt: faker.date.past(),
    updatedAt: faker.date.recent(),
}
const fakeUserWithPassword = { ...fakeUser, password: faker.internet.password() };

describe('UserRepo', () => {
  let repo;

  beforeEach(() => {
    repo = new UserRepo();

    mockFindUnique.mockReset();
    mockCreate.mockReset();
    mockDelete.mockReset();
    mockUpdate.mockReset();
  });

  afterEach(() => { vi.clearAllMocks(); });

  it('findUser should return user', async () => {
    mockFindUnique.mockResolvedValue(fakeUser);

    const result = await repo.findUser(fakeUser.email);
    expect(mockFindUnique).toHaveBeenCalledWith({
        where: { email: fakeUser.email },
    });
    expect(result).toEqual(fakeUser);
  });

  it('getUserById should return user', async () => {
    mockFindUnique.mockResolvedValue(fakeUser);

    const result = await repo.getUserById(fakeUser.id);
    expect(mockFindUnique).toHaveBeenCalledWith({
        where: { id: fakeUser.id },
    });
    expect(result).toEqual(fakeUser);
  });

  it('createUser should create user', async () => {
    mockCreate.mockResolvedValue(fakeUser);

    const result = await repo.createUser(fakeUser);
    expect(mockCreate).toHaveBeenCalledWith({
        data: fakeUser,
    });
    expect(result).toEqual(fakeUser);
  });

  it('delete should delete user', async () => {
    await repo.delete(fakeUser.id);
    expect(mockDelete).toHaveBeenCalledWith({
        where: { id: fakeUser.id },
    });
  });

  it('promote should promote user', async () => {
    await repo.promote(fakeUser.id);
    expect(mockUpdate).toHaveBeenCalledWith({
        where: { id: fakeUser.id },
        data: { admin: true },
    });
  });
 

});