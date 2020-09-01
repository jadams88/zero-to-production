import { TestBed } from '@angular/core/testing';
import { Observable, of } from 'rxjs';
import { Actions } from '@ngrx/effects';
import { GraphQLError } from 'graphql';
import { cold, hot, Scheduler } from 'jest-marbles';
import { provideMockActions } from '@ngrx/effects/testing';
import { createSpyObj } from '@ztp/tests/client';
import { AuthEffects } from './auth.effects';
import { AuthService } from '../services/auth.service';
import * as AuthActions from './auth.actions';
import { ILoginCredentials, IRegistrationDetails } from '../auth.interface';
import { IUser } from '@ztp/data';
import { AuthFacade } from './auth.facade';
import { RouterTestingModule } from '@angular/router/testing';
import { Router } from '@angular/router';
import { Inject } from '@angular/core';
import { LOGIN_PAGE, LOGIN_REDIRECT } from '../tokens/tokens';

describe('AuthEffects', () => {
  let effects: AuthEffects;
  let authService: AuthService;
  let authFacade: AuthFacade;
  let router: Router;
  let actions$: Observable<any>;
  const authSpy = createSpyObj('AuthService', [
    'login',
    'register',
    'userId',
    'revokeRefreshToken',
    'loadUser',
  ]);

  const authFacadeSpy = {};

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [RouterTestingModule],
      providers: [
        AuthEffects,
        { provide: AuthService, useValue: authSpy },
        { provide: AuthFacade, useValue: authFacadeSpy },
        { provide: LOGIN_PAGE, useValue: '/test/login' },
        { provide: LOGIN_REDIRECT, useValue: '/test/home' },
        provideMockActions(() => actions$),
      ],
    });

    effects = TestBed.inject<AuthEffects>(AuthEffects);
    actions$ = TestBed.inject<Actions>(Actions);
    authService = TestBed.inject<AuthService>(AuthService);
    authFacade = TestBed.inject(AuthFacade);
    router = TestBed.inject(Router);
  });

  describe('login$', () => {
    it('should return an LoginSuccess action with token', () => {
      const credentials: ILoginCredentials = { username: 'test', password: '' };
      const token = 'JWT.TOKEN';
      const expiresIn = 1234;
      const action = AuthActions.login(credentials);
      const completion = AuthActions.loginSuccess({ token, expiresIn });

      actions$ = hot('-a---', { a: action });
      // Example graphql response below
      const response = cold('-a|', {
        a: { data: { authorize: { token, expiresIn } } },
      });
      const expected = cold('--b', { b: completion });
      authService.authorize = jest.fn(() => response);

      expect(effects.login$).toBeObservable(expected);
    });

    it('should return a new LoginFailure if the login service throws', () => {
      const credentials: ILoginCredentials = {
        username: 'someOne',
        password: '',
      };
      const action = AuthActions.login(credentials);
      const error = new GraphQLError('Invalid username or password');
      const completion = AuthActions.loginFailure({ error: error.message });

      /**
       * Note that with a GraphQL error, the http request does not fail,
       * rather it succeeds but has a errors property that is an array of GraphQL error
       * hence the response observable is not an error thrown, but a successful response
       */
      actions$ = hot('-a---', { a: action });
      // Do not throw error, success with an errors property
      const response = cold('-a|', { a: { errors: [error] } });
      const expected = cold('--b', { b: completion });
      authService.authorize = jest.fn(() => response);

      expect(effects.login$).toBeObservable(expected);
    });
  });

  describe('loginSuccess$', () => {
    it('should route to the login redirect url', () => {
      const spy = jest
        .spyOn(router, 'navigate')
        .mockImplementationOnce((url) => Promise.resolve(true));

      const token = 'JWT.TOKEN';
      const expiresIn = 1234;
      const action = AuthActions.loginSuccess({ token, expiresIn });

      actions$ = hot('-a---', { a: action });

      effects.loginSuccess$.subscribe();

      Scheduler.get().flush();

      expect(spy).toHaveBeenCalled();
      expect(spy).toHaveBeenCalledWith(['/test/home']);
    });
  });

  describe('register$', () => {
    it('should return an RegisterSuccess action with user information', () => {
      const newUser: IRegistrationDetails = {
        username: 'test user',
        givenName: 'test',
        surname: 'user',
        email: 'test@domain.com',
        dateOfBirth: '2019-01-01',
        password: 'asF.s0f.s',
      };

      const registeredUser: IUser = {
        id: 'some-id',
        active: true,
        isVerified: true,
        ...newUser,
      };

      const action = AuthActions.register({ details: newUser });
      const completion = AuthActions.registerSuccess({ user: registeredUser });

      actions$ = hot('-a---', { a: action });
      // Example graphql response below
      const response = cold('-a|', {
        a: { data: { register: registeredUser } },
      });
      const expected = cold('--b', { b: completion });
      authService.register = jest.fn(() => response);

      expect(effects.register$).toBeObservable(expected);
    });

    it('should return a new RegisterFail if the registration throws', () => {
      const newUser = {
        username: 'test user',
        givenName: 'test',
        surname: 'user',
        email: 'test@domain.com',
        dateOfBirth: '2019-01-01',
      } as IRegistrationDetails;

      const action = AuthActions.register({ details: newUser });

      const error = new GraphQLError('Password not provided');
      const completion = AuthActions.registerFailure({ error: error.message });

      actions$ = hot('-a---', { a: action });
      // Do not throw error, success with an errors property
      const response = cold('-a|', { a: { errors: [error] } });
      const expected = cold('--b', { b: completion });
      authService.register = jest.fn(() => response);

      expect(effects.register$).toBeObservable(expected);
    });
  });

  describe('registerSuccess$', () => {
    it('should route to the login url', () => {
      const spy = jest
        .spyOn(router, 'navigate')
        .mockImplementationOnce((url) => Promise.resolve(true));

      const action = AuthActions.registerSuccess({ user: {} as IUser });

      actions$ = hot('-a---', { a: action });

      effects.registerSuccess$.subscribe();

      Scheduler.get().flush();

      expect(spy).toHaveBeenCalled();
      expect(spy).toHaveBeenCalledWith(['/test/login']);

      spy.mockReset();
      spy.mockClear();
    });
  });

  describe('logout$', () => {
    it('should navigate to the login page', () => {
      const navSpy = jest
        .spyOn(router, 'navigate')
        .mockImplementationOnce((url) => Promise.resolve(true));
      const spy = jest
        .spyOn(authService, 'revokeRefreshToken')
        .mockReturnValueOnce(of({ success: true }));

      const action = AuthActions.logout();

      actions$ = hot('-a---', { a: action });

      effects.logout$.subscribe();

      Scheduler.get().flush();

      expect(navSpy).toHaveBeenCalled();
      expect(navSpy).toHaveBeenCalledWith(['/test/login']);

      spy.mockReset();
      navSpy.mockClear();
    });

    it('should revoke the refresh token', () => {
      const navSpy = jest
        .spyOn(router, 'navigate')
        .mockImplementationOnce((url) => Promise.resolve(true));
      const spy = jest
        .spyOn(authService, 'revokeRefreshToken')
        .mockReturnValueOnce(of({ success: true }));

      const action = AuthActions.logout();

      actions$ = hot('-a---', { a: action });

      effects.logout$.subscribe();

      Scheduler.get().flush();

      expect(spy).toHaveBeenCalled();
      expect(spy).toHaveBeenCalledWith();

      spy.mockReset();
      navSpy.mockClear();
    });
  });

  describe('loadAuthUser$', () => {
    it('should load the currently authenticated user', () => {
      const user = {
        username: 'test user',
        givenName: 'test',
        surname: 'user',
        email: 'test@domain.com',
        dateOfBirth: '2019-01-01',
      } as IUser;

      authFacade.accessToken$ = of('TOKEN');
      authService.userId = jest.fn(() => '1');

      const action = AuthActions.loadAuthUser();
      const completion = AuthActions.loadAuthUserSuccess({ user });

      actions$ = hot('-a---', { a: action });
      // Do not throw error, success with an errors property
      const expected = cold('--b', { b: completion });

      const response = cold('-a|', { a: { data: { User: user } } });
      authService.loadUser = jest.fn(() => response);

      expect(effects.loadAuthUser$).toBeObservable(expected);
    });

    it('should return LoadAuthUserFail if there is no token', () => {
      authFacade.accessToken$ = of('TOKEN');
      authService.userId = jest.fn(() => null);

      const action = AuthActions.loadAuthUser();
      const completion = AuthActions.loadAuthUserFail({
        error: 'User is not logged in',
      });

      actions$ = hot('-a---', { a: action });
      const expected = cold('-b', { b: completion });

      expect(effects.loadAuthUser$).toBeObservable(expected);
    });

    it('should return LoadAuthUserFail if authService.loadUser returns errors', () => {
      authFacade.accessToken$ = of('TOKEN');
      authService.userId = jest.fn(() => '1');

      const action = AuthActions.loadAuthUser();
      const completion = AuthActions.loadAuthUserFail({
        error: 'Can not find user',
      });

      actions$ = hot('-a---', { a: action });
      const response = cold('-a|', {
        a: { errors: [{ message: 'Can not find user' }] },
      });

      authService.loadUser = jest.fn(() => response);

      const expected = cold('--b', { b: completion });

      expect(effects.loadAuthUser$).toBeObservable(expected);
    });

    it('should return LoadAuthUserFail if authService.loadUser throws', () => {
      authFacade.accessToken$ = of('TOKEN');
      authService.userId = jest.fn(() => '1');

      const action = AuthActions.loadAuthUser();
      const completion = AuthActions.loadAuthUserFail({
        error: 'Error retrieving user',
      });

      const error = { message: 'Error retrieving user' };

      actions$ = hot('-a---', { a: action });

      const response = cold('-#', {}, error);

      authService.loadUser = jest.fn(() => response);

      const expected = cold('--b', { b: completion });

      expect(effects.loadAuthUser$).toBeObservable(expected);
    });
  });

  describe('clearAuthenticatedUser$', () => {
    it('should clear the auth auth user', () => {
      const action = AuthActions.logout();
      const completion = AuthActions.clearAuthUser();

      actions$ = hot('-a-', { a: action });
      const expected = cold('-b', { b: completion });

      expect(effects.clearAuthenticatedUser$).toBeObservable(expected);
    });
  });
});
