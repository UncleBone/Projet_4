import { faker } from '@faker-js/faker';
import { TeacherRepo } from './teacher.repo';

const mockFindMany = vi.fn();
const mockFindUnique = vi.fn();

vi.mock('@prisma/client', () => {
  return {
    PrismaClient: class {
      teacher = {
        findMany: (param) => mockFindMany(param),
        findUnique: (param) => mockFindUnique(param),
      };
    }
  }
});

const teachers = [
    { id: 1, firstName: faker.person.firstName(), lastName: faker.person.lastName(), createdAt: faker.date.past(), updatedAt: faker.date.recent() },
    { id: 2, firstName: faker.person.firstName(), lastName: faker.person.lastName(), createdAt: faker.date.past(), updatedAt: faker.date.recent() },
]

describe('TeacherRepo', () => {
  let repo;

  beforeEach(() => {
    repo = new TeacherRepo();

    mockFindMany.mockReset();
    mockFindUnique.mockReset();
  });

  afterEach(() => { vi.clearAllMocks(); });

  it('getAll should return teachers', async () => {
    mockFindMany.mockResolvedValue(teachers);

    const result = await repo.getAll();
    expect(mockFindMany).toHaveBeenCalledOnce();
    expect(result).toEqual(teachers);
  });
 
  it('getTeacherById should return teacher', async () => {
    mockFindUnique.mockResolvedValue(teachers[0]);

    const result = await repo.getTeacherById();
    expect(mockFindUnique).toHaveBeenCalledOnce();
    expect(result).toEqual(teachers[0]);
  });
});