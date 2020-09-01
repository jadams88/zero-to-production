import { TestBed } from '@angular/core/testing';
import { GraphQLError } from 'graphql';
import { HttpStub } from '@ztp/tests/client';
import { AuthService } from './auth.service';
import {
  ILoginCredentials,
  ILoginResponse,
  IRegistrationDetails,
} from '../auth.interface';
import { IUser } from '@ztp/data';
import { AuthFacade } from '../+state/auth.facade';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { HttpClient } from '@angular/common/http';
import { AUTH_SERVER_URL } from '../tokens/tokens';
import { of } from 'rxjs';

describe('AuthService', () => {
  const AUTH_SERVER = 'https://auth.com';

  let authService: AuthService;
  let http: HttpStub;
  let authFacade: AuthFacade;

  const facadeStub = { setAuthenticated: jest.fn() };

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        AuthService,
        { provide: AuthFacade, useValue: facadeStub },
        { provide: AUTH_SERVER_URL, useValue: AUTH_SERVER },
        { provide: HttpClient, useClass: HttpStub },
      ],
    });
    authService = TestBed.inject<AuthService>(AuthService);
    http = (TestBed.inject(HttpClient) as unknown) as HttpStub;
    authFacade = TestBed.inject<AuthFacade>(AuthFacade);
  });

  it('should be created', () => {
    expect(authService).toBeTruthy();
  });

  describe('authorize', () => {
    // GraphQL login response check
    it('should return a LoginResponse if called with valid credentials', (done) => {
      const spy = jest.spyOn(http, 'post');
      const expectedResponse: ILoginResponse = {
        token: 'JWT',
        expiresIn: 1000,
      };

      const credentials: ILoginCredentials = {
        username: 'admin',
        password: 'secret',
      };

      // Set the response from the the stub
      http.setExpectedResponse<{ data: { authorize: ILoginResponse } }>({
        data: { authorize: expectedResponse },
      });
      authService.authorize(credentials).subscribe((response) => {
        const { body } = response as any;
        expect(body.errors).toBeUndefined();
        expect((body.data as any).authorize).toBeDefined();
        expect((body.data as any).authorize).toEqual(expectedResponse);
        expect(http.post).toHaveBeenCalled();
        expect(spy.mock.calls[0][1].operationName).toEqual('Authorize');
        expect(spy.mock.calls[0][1].variables).toEqual(credentials);
        done();
      }, console.error);

      spy.mockClear();
    });
    it('should return an error if credentials are incorrect', (done) => {
      const spy = jest.spyOn(http, 'post');
      const loginCredentials: ILoginCredentials = {
        username: 'unauthorized',
        password: 'noi dea',
      };
      const graphQLErrors = [
        { name: 'Unauthorized Error', message: 'Unauthorized' },
      ] as GraphQLError[];
      // Set the response from the the stub

      http.setExpectedResponse<{ errors: GraphQLError[]; data: null }>({
        errors: graphQLErrors,
        data: null,
      });

      authService.authorize(loginCredentials).subscribe((response) => {
        const { body } = response as any;
        expect(body.data).toEqual(null);
        expect(body.errors).toBeDefined();
        expect(body.errors[0].message).toEqual('Unauthorized');
        expect(http.post).toHaveBeenCalled();
        done();
      }, console.error);

      spy.mockClear();
    });
  });

  describe('register', () => {
    // GraphQL login response check
    it('should return a User if registration is successfully', (done) => {
      const spy = jest.spyOn(http, 'post');
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
      http.setExpectedResponse<{ data: { user: IUser } }>({
        data: { user: expectedResponse },
      });

      authService.register(newUser).subscribe((response) => {
        const { body } = response as any;
        expect(body.errors).toBeUndefined();
        expect(body.data.user).toBeDefined();
        expect(body.data.user).toEqual(expectedResponse);
        expect(http.post).toHaveBeenCalled();
        expect(spy.mock.calls[0][1].operationName).toEqual('Register');
        expect(spy.mock.calls[0][1].variables).toEqual({ input: newUser });
        done();
      }, console.error);

      spy.mockClear();
    });
    it('should return an error if registration is invalid', (done) => {
      const spy = jest.spyOn(http, 'post');

      const newUser = ({
        username: 'test user',
        givenName: 'test',
        surname: 'user',
        email: 'test@domain.com',
        dateOfBirth: '2019-01-01',
      } as any) as IRegistrationDetails;

      const graphQLErrors = [
        { name: 'Bad request', message: 'No password provided' },
      ] as GraphQLError[];

      http.setExpectedResponse<{ errors: GraphQLError[]; data: null }>({
        errors: graphQLErrors,
        data: null,
      });

      authService.register(newUser).subscribe((response) => {
        const { body } = response as any;
        expect(body.data).toEqual(null);
        expect(body.errors).toBeDefined();
        expect(body.errors[0].message).toEqual('No password provided');
        expect(http.post).toHaveBeenCalled();
        done();
      }, console.error);

      spy.mockClear();
    });
  });

  describe('loadUser', () => {
    // GraphQL login response check
    it('should load a user by id', (done) => {
      const id = '1';
      const spy = jest.spyOn(http, 'post');
      const user: IUser = {
        id,
        username: 'test user',
        givenName: 'test',
        surname: 'user',
        email: 'test@domain.com',
        dateOfBirth: '2019-01-01',
        active: true,
        isVerified: true,
      };
      http.setExpectedResponse<{ data: { User: IUser } }>({
        data: { User: user },
      });

      authService.loadUser(id).subscribe((response) => {
        const { body } = response as any;
        expect(body.errors).toBeUndefined();
        expect(body.data.User).toBeDefined();
        expect(body.data.User).toEqual(user);
        expect(http.post).toHaveBeenCalled();
        expect(spy.mock.calls[0][1].operationName).toEqual('AuthUser');
        expect(spy.mock.calls[0][1].variables).toEqual({ id });
        done();
      }, console.error);

      spy.mockClear();
    });
    it('should return an error if it can not load the user', (done) => {
      const spy = jest.spyOn(http, 'post');
      const id = '1';

      const graphQLErrors = [
        { name: 'Bad request', message: 'no user found' },
      ] as GraphQLError[];

      http.setExpectedResponse<{ errors: GraphQLError[]; data: null }>({
        errors: graphQLErrors,
        data: null,
      });

      authService.loadUser(id).subscribe((response) => {
        const { body } = response as any;
        expect(body.data).toEqual(null);
        expect(body.errors).toBeDefined();
        expect(body.errors[0].message).toEqual('no user found');
        expect(http.post).toHaveBeenCalled();
        done();
      }, console.error);

      spy.mockClear();
    });
  });

  describe('refreshAccessToken', () => {
    // GraphQL login response check
    it('it should try and refresh the access token', (done) => {
      const spy = jest.spyOn(http, 'post');

      http.setExpectedResponse<{ token: string; expiresIn: number }>({
        token: 'TOKEN',
        expiresIn: 123,
      });

      authService.refreshAccessToken().subscribe((response) => {
        expect(http.post).toHaveBeenCalled();
        expect(spy.mock.calls[0][0]).toEqual(
          `${AUTH_SERVER}/authorize/refresh`
        );
        expect(spy.mock.calls[0][1]).toEqual({});
        done();
      }, console.error);

      spy.mockClear();
    });
  });

  describe('refreshAccessToken', () => {
    // GraphQL login response check
    it('it should revoke the refresh token (cookie)', (done) => {
      const spy = jest.spyOn(http, 'post');

      http.setExpectedResponse<{ success: boolean }>({
        success: true,
      });

      authService.revokeRefreshToken().subscribe((response) => {
        expect(http.post).toHaveBeenCalled();
        expect(spy.mock.calls[0][0]).toEqual(`${AUTH_SERVER}/authorize/revoke`);
        expect(spy.mock.calls[0][1]).toEqual({});
        done();
      }, console.error);

      spy.mockClear();
    });
  });

  describe('initLogin', () => {
    // GraphQL login response check
    it('it should try and refresh the access token', (done) => {
      const spy = jest.spyOn(http, 'post');

      http.setExpectedResponse<{ token: string; expiresIn: number }>({
        token: 'TOKEN',
        expiresIn: 123,
      });

      authService.initLogin().subscribe((response) => {
        expect(http.post).toHaveBeenCalled();
        expect(spy.mock.calls[0][0]).toEqual(
          `${AUTH_SERVER}/authorize/refresh`
        );
        expect(spy.mock.calls[0][1]).toEqual({});
        done();
      }, console.error);

      spy.mockClear();
    });
    it('it should set authenticated if refresh was successful', (done) => {
      const spy = jest.spyOn(authFacade, 'setAuthenticated');
      authService.refreshAccessToken = jest.fn(() =>
        of({
          token: 'TOKEN',
          expiresIn: 123,
        })
      );

      authService.initLogin().subscribe((response) => {
        expect(spy).toHaveBeenCalled();
        expect(spy.mock.calls[0][0]).toEqual({
          token: 'TOKEN',
          expiresIn: 123,
        });
        done();
      }, console.error);

      spy.mockClear();
    });

    it('it should not set authenticated if refresh was unsuccessful', (done) => {
      const spy = jest.spyOn(authFacade, 'setAuthenticated');
      authService.refreshAccessToken = jest.fn(() =>
        of({
          token: null,
          expiresIn: null,
        })
      );

      authService.initLogin().subscribe((response) => {
        expect(spy).not.toHaveBeenCalled();
        done();
      }, console.error);

      spy.mockClear();
    });
  });
});
