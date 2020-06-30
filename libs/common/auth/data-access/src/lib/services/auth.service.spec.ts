import { TestBed } from '@angular/core/testing';
import { GraphQLError } from 'graphql';
import { sign } from 'jsonwebtoken';
import { GraphQLStub } from '@ztp/tests/client';
import { AuthService, AUTH_SERVER_URL } from './auth.service';
import {
  ILoginCredentials,
  ILoginResponse,
  IRegistrationDetails,
} from '../auth.interface';
import { IUser } from '@ztp/data';
import { AuthFacade } from '../+state/auth.facade';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { GraphQLService } from '@ztp/common/data-access';

describe('AuthService', () => {
  const storageKey = 'access_token';
  const sessionKey = 'expires_at';

  let authService: AuthService;
  let apollo: GraphQLStub;
  let authFacade: AuthFacade;

  const facadeStub = { setAuthenticated: jest.fn() };

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        AuthService,
        { provide: Apollo, useClass: GraphQLStub },
        { provide: AuthFacade, useValue: facadeStub },
        { provide: AUTH_SERVER_URL, useValue: 'test-url' },
      ],
    });
    authService = TestBed.inject<AuthService>(AuthService);
    apollo = (TestBed.inject<Apollo>(Apollo) as unknown) as GraphQLStub;
    authFacade = TestBed.inject<AuthFacade>(AuthFacade);
  });

  it('should be created', () => {
    expect(authService).toBeTruthy();
  });

  describe('login', () => {
    // GraphQL login response check
    it('should return a LoginResponse if called with valid credentials', () => {
      const spy = jest.spyOn(apollo, 'mutate');
      const loginCredentials: ILoginCredentials = {
        username: 'admin',
        password: 'secret',
      };
      const expectedResponse: ILoginResponse = {
        token: 'JWT',
        expiresIn: 1000,
      };
      // Set the response from the the stub
      apollo.setExpectedResponse<{
        login: ILoginResponse;
      }>({
        login: expectedResponse,
      });
      authService.login(loginCredentials).subscribe((response) => {
        expect(response.errors).toBeUndefined();
        expect((response.data as any).login).toBeDefined();
        expect((response.data as any).login).toEqual(expectedResponse);
        expect(apollo.mutate).toHaveBeenCalled();
        expect(spy.mock.calls[0][1]).toEqual(loginCredentials);
      }, console.error);
    });
    it('should return an error if credentials are incorrect', () => {
      const spy = jest.spyOn(apollo, 'mutate');
      const loginCredentials: ILoginCredentials = {
        username: 'unauthorized',
        password: 'noi dea',
      };
      const graphErrors = [
        { name: 'Unauthorized Error', message: 'Unauthorized' },
      ] as GraphQLError[];
      // Set the response from the the stub
      apollo.setErrorResponse(graphErrors);
      authService.login(loginCredentials).subscribe((response) => {
        expect(response.data).toEqual(null);
        expect(response.errors).toBeDefined();
        expect((response.errors as any[][0]).message).toEqual('Unauthorized');
        expect(apollo.mutate).toHaveBeenCalled();
        expect(spy.mock.calls[0][1]).toEqual(loginCredentials);
      }, console.error);
    });
  });

  describe('register', () => {
    // GraphQL login response check
    it('should return a User if registration is successfully', () => {
      const spy = jest.spyOn(apollo, 'mutate');
      const newUser: IRegistrationDetails = {
        username: 'test user',
        givenName: 'test',
        surname: 'user',
        email: 'test@domain.com',
        dateOfBirth: '2019-01-01',
        password: 'asF.s0f.s',
      };

      const expectedResponse: IUser = {
        id: 'some-id',
        active: true,
        isVerified: true,
        ...newUser,
      };

      // Set the response from the the stub
      apollo.setExpectedResponse<{
        user: IUser;
      }>({
        user: expectedResponse,
      });

      authService.register(newUser).subscribe((response) => {
        expect(response.errors).toBeUndefined();
        expect((response.data as any).login).toBeDefined();
        expect((response.data as any).login).toEqual(expectedResponse);
        expect(apollo.mutate).toHaveBeenCalled();
        expect(spy.mock.calls[0][1]).toEqual(newUser);
      }, console.error);
    });
    it('should return an error if registration is invalid', () => {
      const spy = jest.spyOn(apollo, 'mutate');

      const newUser = ({
        username: 'test user',
        givenName: 'test',
        surname: 'user',
        email: 'test@domain.com',
        dateOfBirth: '2019-01-01',
      } as any) as IRegistrationDetails;

      const graphErrors = [
        { name: 'Bad request', message: 'No password provided' },
      ] as GraphQLError[];

      // Set the response from the the stub
      apollo.setErrorResponse(graphErrors);
      authService.register(newUser).subscribe((response) => {
        expect(response.data).toEqual(null);
        expect(response.errors).toBeDefined();
        expect((response.errors as any[][0]).message).toEqual(
          'No password provided'
        );
        expect(apollo.mutate).toHaveBeenCalled();
        expect(spy.mock.calls[0][1]).toEqual(newUser);
      }, console.error);
    });
  });

  describe('setSession', () => {
    it('should set access token and expiresAt in local storage', () => {
      localStorage.removeItem(storageKey);
      localStorage.removeItem(sessionKey);

      const currentToken = localStorage.getItem(storageKey);
      const currentSession = localStorage.getItem(sessionKey);

      expect(currentToken).toBe(null);
      expect(currentSession).toBe(null);

      const token = 'SOME_TOKEN';
      const expiresIn = 1234;

      authService.setSession({ token, expiresIn });

      const newToken = localStorage.getItem(storageKey);
      const newSession = localStorage.getItem(sessionKey);

      expect(newToken).toBe(token);
      expect(newSession).not.toBe(null);
    });
  });

  describe('removeSession', () => {
    it('should remove the access token and expiresAa in local storage', () => {
      const token = 'SOME_TOKEN';
      const expiresIn = 1234;

      localStorage.setItem(storageKey, token);
      localStorage.setItem(sessionKey, expiresIn.toString());

      const currentToken = localStorage.getItem(storageKey);
      const currentSession = localStorage.getItem(sessionKey);

      expect(currentToken).toBe(token);
      expect(currentSession).toBe(expiresIn.toString());

      authService.removeSession();

      const newToken = localStorage.getItem(storageKey);
      const newSession = localStorage.getItem(sessionKey);

      expect(newToken).toBe(null);
      expect(newSession).toBe(null);
    });
  });

  describe('authToken', () => {
    it('should return the access token if present', () => {
      const JWT = 'SOME_TOKEN';
      localStorage.setItem(storageKey, JWT);
      const token = authService.authToken;

      expect(token).toBeDefined();
      expect(token).toEqual(JWT);
    });

    it('should return null if no token present', () => {
      localStorage.removeItem(storageKey);
      const token = authService.authToken;

      expect(token).toEqual(null);
    });
  });

  describe('authUserId', () => {
    it('should return the user id of the authenticated user', () => {
      const subject = '123';
      const JWT = sign({}, 'secret', {
        subject,
        expiresIn: 1000,
      });

      localStorage.setItem(storageKey, JWT);
      const userId = authService.authUserId;

      expect(userId).toEqual(subject);
    });

    it('should return null if no token present', () => {
      localStorage.removeItem(storageKey);
      const userId = authService.authUserId;

      expect(userId).toEqual(null);
    });
  });

  describe('isLoggedIn', () => {
    it('should update the auth state with authenticated details if the session is valid', () => {
      localStorage.removeItem(sessionKey);
      const setAuthSpy = jest.spyOn(authFacade, 'setAuthenticated');
      const removeSessionSpy = jest.spyOn(authService, 'removeSession');
      jest.clearAllMocks();

      const futureTime = new Date().valueOf() + 1000;
      localStorage.setItem(sessionKey, futureTime.toString());

      authService.isLoggedIn();

      expect(setAuthSpy).toHaveBeenCalled();
      expect(setAuthSpy).toHaveBeenCalledWith(true, futureTime);
      expect(removeSessionSpy).not.toHaveBeenCalled();
    });

    it('should update the auth state with un-authenticated details if there is no session', () => {
      localStorage.removeItem(sessionKey);

      const setAuthSpy = jest.spyOn(authFacade, 'setAuthenticated');
      const removeSessionSpy = jest.spyOn(authService, 'removeSession');
      jest.clearAllMocks();

      authService.isLoggedIn();

      expect(setAuthSpy).toHaveBeenCalled();
      expect(setAuthSpy).toHaveBeenCalledWith(false, null);
      expect(removeSessionSpy).toHaveBeenCalled();
    });

    it('should update the auth state with un-authenticated details if the session is expired', () => {
      localStorage.removeItem(sessionKey);
      const pastTime = new Date().valueOf() - 1000;
      localStorage.setItem(sessionKey, pastTime.toString());

      const setAuthSpy = jest.spyOn(authFacade, 'setAuthenticated');
      const removeSessionSpy = jest.spyOn(authService, 'removeSession');
      jest.clearAllMocks();

      authService.isLoggedIn();

      expect(setAuthSpy).toHaveBeenCalled();
      expect(setAuthSpy).toHaveBeenCalledWith(false, null);
      expect(removeSessionSpy).toHaveBeenCalled();
    });
  });
});
