import request from 'supertest';
import app from '../app';
import { faker } from '@faker-js/faker';
import { generateToken } from '../utils/jwt.util';

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
const sessionForm = {
  name: faker.lorem.word(),
  date: new Date(),
  description: faker.lorem.paragraph(),
  teacherId: 1
}
const updateSessionForm = {
  name: faker.lorem.word(),
  date: new Date(),
  description: faker.lorem.paragraph(),
  teacherId: 2
}
let newUserId;
let newUserToken;
let newSessionId;

describe('Health check', () => {
  it('should return status ok', async () => {
    const response = await request(app).get('/api/health');

    expect(response.status).toBe(200);
    expect(response.body.status).toBe('ok');
  });
});

const originalEnv = process.env.NODE_ENV;

beforeEach(() => {
    process.env.NODE_ENV = 'development';
})

afterEach(() => {
    process.env.NODE_ENV = originalEnv;
})


describe('API Router', () => {

  it('POST /api/auth/login - should return 200 and token', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'user@test.com', password: 'test!1234' });

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('token');
  });

  it('GET /api/session - should require token and return 401 without auth', async () => {
    const res = await request(app).get('/api/session');
    expect(res.statusCode).toBe(401);
    expect(res.body).toHaveProperty('message', 'No token provided');
  });

  it('GET /api/session - with valid token should return 200', async () => {
    const token = generateToken(fakeUser.id);

    const res = await request(app)
      .get('/api/session')
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true)
  });

  it('GET /api/session/:id - should require token and return 401 without auth', async () => {
    const res = await request(app).get('/api/session/2');
    expect(res.statusCode).toBe(401);
    expect(res.body).toHaveProperty('message', 'No token provided');
  });

  it('GET /api/session/:id - with valid token should return 200', async () => {
    const token = generateToken(fakeUser.id);

    const res = await request(app)
      .get('/api/session/2')
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty("name")
  });

  it('POST /api/session - should require token and return 401 without auth', async () => {
    const res = await request(app)
      .post('/api/session')
      .send(sessionForm);

    expect(res.statusCode).toBe(401);
  });

  it('PUT /api/session/:id - should require token and return 401 without auth', async () => {
    const res = await request(app)
      .put('/api/session/1')
      .send(sessionForm);

    expect(res.statusCode).toBe(401);
  });

  it('DELETE /api/session/:id - should require token and return 401 without auth', async () => {
    const res = await request(app)
      .delete('/api/session/1')

    expect(res.statusCode).toBe(401);
  });

  it('POST /api/session/:id/participate/:userId - should require token and return 401 without auth', async () => {
    const res = await request(app)
      .post('/api/session/2/participate/2')

    expect(res.statusCode).toBe(401);
  });

  it('DELETE /api/session/:id/participate/:userId - should require token and return 401 without auth', async () => {
    const res = await request(app)
      .delete('/api/session/2/participate/2')

    expect(res.statusCode).toBe(401);
  });

  it('GET /api/teacher - should require token and return 401 without auth', async () => {
    const res = await request(app).get('/api/teacher');
    expect(res.statusCode).toBe(401);
    expect(res.body).toHaveProperty('message', 'No token provided');
  });

  it('GET /api/teacher - with valid token should return 200', async () => {
    const token = generateToken(fakeUser.id);

    const res = await request(app)
      .get('/api/teacher')
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true)
  });

  it('GET /api/teacher/:id - should require token and return 401 without auth', async () => {
    const res = await request(app).get('/api/teacher/1');
    expect(res.statusCode).toBe(401);
    expect(res.body).toHaveProperty('message', 'No token provided');
  });

  it('GET /api/teacher/:id - with valid token should return 200', async () => {
    const token = generateToken(fakeUser.id);

    const res = await request(app)
      .get('/api/teacher/1')
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('firstName')
  });

  it('GET /api/user/:id - should require token and return 401 without auth', async () => {
    const res = await request(app).get('/api/user/1');
    expect(res.statusCode).toBe(401);
    expect(res.body).toHaveProperty('message', 'No token provided');
  });

  it('GET /api/user/:id - with valid token should return 200', async () => {
    const token = generateToken(1);

    const res = await request(app)
      .get('/api/user/1')
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('firstName')
  });

  it('POST /api/user/promote-admin - should require token and return 401 without auth', async () => {
    const res = await request(app).post('/api/user/promote-admin');
    expect(res.statusCode).toBe(401);
    expect(res.body).toHaveProperty('message', 'No token provided');
  });

  it('DELETE /api/user/:id - should require token and return 401 without auth', async () => {
    const res = await request(app).delete('/api/user/1');
    expect(res.statusCode).toBe(401);
    expect(res.body).toHaveProperty('message', 'No token provided');
  });

  it('POST /api/auth/register - should return 201 and token', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send(fakeUserWithPassword);

    newUserId = res.body.id;
    newUserToken = res.body.token;
    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty('token');

  });

  it('POST /api/user/promote-admin - should return 200 with valid auth', async () => {
    const res = await request(app)
      .post('/api/user/promote-admin')
      .set('Authorization', `Bearer ${newUserToken}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.admin).toBe(true);
  });

  it('DELETE /api/user/:id - should 200 with valid auth', async () => {
    const res = await request(app).delete(`/api/user/${newUserId}`)
      .set('Authorization', `Bearer ${newUserToken}`);
    ;
    expect(res.statusCode).toBe(200);
  });

  it('POST /api/session - should return 201 with valid auth', async () => {
    const token = generateToken(1);
    const res = await request(app)
      .post('/api/session')
      .send(sessionForm)
      .set('Authorization', `Bearer ${token}`);

    newSessionId = res.body.id;
    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty('name');
    expect(res.body.name).toBe(sessionForm.name);
  });

  it('PUT /api/session/:id - should return 200 with valid auth', async () => {
    const token = generateToken(1);
    const res = await request(app)
      .put(`/api/session/${newSessionId}`)
      .send(updateSessionForm)
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.name).toBe(updateSessionForm.name);
  });

  it('DELETE /api/session/:id - should require 200 with valid auth', async () => {
    const token = generateToken(1);
    const res = await request(app)
      .delete(`/api/session/${newSessionId}`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toBe(200);
  });

});