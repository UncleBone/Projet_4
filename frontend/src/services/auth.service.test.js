import { authService } from './auth.service.ts';
import { server } from '../test/mocks/server'
import { handlers } from '../test/mocks/handlers'
import { http, HttpResponse } from 'msw'
import { beforeAll, test } from 'vitest';

const testUser = {
    firstName: "test first name",
    lastName: "test last name",
    email: "test@email.com"
}

beforeAll(() => {
    global.localStorage = {
        removeItem: vi.fn(),
        getItem: vi.fn(),
        setItem: vi.fn(),
    };
})

beforeEach(() => {
    global.localStorage.setItem.mockClear();
    global.localStorage.getItem.mockClear();
    global.localStorage.removeItem.mockClear();
});

describe('auth service', () => {
  it('should return credentials with token at login', async () => {
    const token = "test_token"
    const response = await authService.login(testUser);

    expect(response).toEqual({ ...testUser, token });
  })

  it('should store token and user at register if token in response', async () => {
    const spy = global.localStorage.setItem;
    const response = await authService.register(testUser);
    const token = response.token;

    expect(spy).toHaveBeenCalledWith('token',token);
    expect(spy).toHaveBeenCalledWith('user',JSON.stringify(response));

  })

  it('should return credentials with token at register', async () => {
    const token = "test_token"
    const response = await authService.register(testUser);

    expect(response).toEqual({ ...testUser, token });
  })

  it('should not store token and user at register if no token in response', async () => {
    server.resetHandlers();
    server.use(
        http.post('/api/auth/register', () => {
            return HttpResponse.json(testUser)
        })
    )
    await authService.register(testUser);

    expect(global.localStorage.setItem).not.toHaveBeenCalled();
  })

  it('should remove user from local storage at logout', () => {
    server.resetHandlers();
    const spy = global.localStorage.removeItem;

    authService.logout();

    expect(spy).toHaveBeenCalledWith('token')
    expect(spy).toHaveBeenCalledWith('user')

  })

  it('getCurrentUser should return user ', () => {
    const spy = global.localStorage.getItem;
    spy.mockReturnValue(JSON.stringify(testUser))

    expect(authService.getCurrentUser()).toEqual(testUser);
  })

  it('getCurrentUser should return null if user doesnt exist', () => {
    const spy = global.localStorage.getItem;
    spy.mockReturnValue(undefined)

    expect(authService.getCurrentUser()).toEqual(null);
  })

  it('updateCurrentUser should return modified user ', () => {
    const getSpy = global.localStorage.getItem;
    const setSpy = global.localStorage.setItem;
    getSpy.mockReturnValue(JSON.stringify(testUser))
    const update = {
        email: "new@email.com"
    }
    const newUser = { ...testUser, ...update };

    expect(authService.updateCurrentUser(update)).toEqual(newUser);
    expect(setSpy).toHaveBeenCalledWith('user', JSON.stringify(newUser));
  })

  it('updateCurrentUser should return null if user doesnt exist in storage', () => {
    const getSpy = global.localStorage.getItem;
    getSpy.mockReturnValue(undefined)
    const update = {
        email: "new@email.com"
    }

    expect(authService.updateCurrentUser(update)).toEqual(null);
  })

  it('getToken should return token ', () => {
    const getSpy = global.localStorage.getItem;
    getSpy.mockReturnValue("test_token")
    
    expect(authService.getToken()).toEqual("test_token");
    expect(getSpy).toHaveBeenCalledWith('token');
  })

  it('isAuthenticated should return true if token exists in storage', () => {
    const getSpy = global.localStorage.getItem;
    getSpy.mockReturnValue("test_token")
    
    expect(authService.isAuthenticated()).toEqual(true);
  })

  it('isAuthenticated should return false if token doesnt exists in storage', () => {
    const getSpy = global.localStorage.getItem;
    getSpy.mockReturnValue(undefined)
    
    expect(authService.isAuthenticated()).toEqual(false);
  })

})