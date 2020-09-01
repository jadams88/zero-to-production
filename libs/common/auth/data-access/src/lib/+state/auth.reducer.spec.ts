import { authReducer, AuthState, initialState } from './auth.reducer';
import * as AuthActions from './auth.actions';
import { IUser } from '@ztp/data';

// Do this so that the Date object always produces the same value each test in the reducer
Date.now = jest.fn(() => new Date(Date.UTC(2020, 1, 10, 8)).valueOf());

describe('AuthReducer', () => {
  describe('undefined action', () => {
    it('should return the default state', () => {
      const action = {} as any;
      const result = authReducer(undefined, action);
      expect(result).toMatchSnapshot();
    });
  });

  describe('LoginSuccess', () => {
    it('should set the authenticated state', () => {
      // Do this so that the Date object always produces the same value each test in the reducer
      // Date.now = jest.fn(() => new Date(Date.UTC(2020, 1, 10, 8)).valueOf());

      const authResponse = {
        token: 'SOME_JWT',
        expiresIn: 1234,
      };

      const action = AuthActions.loginSuccess(authResponse);
      const result = authReducer(initialState, action);
      expect(result).toMatchSnapshot();
    });
  });
  describe('SetAuthenticated', () => {
    it('should set the authenticated state', () => {
      // Do this so that the Date object always produces the same value each test in the reducer
      // Date.now = jest.fn(() => new Date(Date.UTC(2020, 1, 10, 8)).valueOf());

      const authResponse = {
        token: 'SOME_JWT',
        expiresIn: 1234,
      };

      const action = AuthActions.setAuthenticated(authResponse);
      const result = authReducer(initialState, action);
      expect(result).toMatchSnapshot();
    });
  });

  describe('LoadAuthUserSuccess', () => {
    it('should set the authenticated user', () => {
      const state: AuthState = {
        authenticated: true,
        accessToken: 'JWT',
        expiresAt: 1234,
        user: null,
      };

      const user = {
        id: '123',
        username: 'some user',
      } as IUser;

      const action = AuthActions.loadAuthUserSuccess({ user });
      const result = authReducer(state, action);
      expect(result).toMatchSnapshot();
    });
  });

  describe('ClearAuthUser', () => {
    it('should remove the authenticated user', () => {
      const user = {
        id: '123',
        username: 'some user',
      } as IUser;

      const state: AuthState = {
        authenticated: true,
        accessToken: 'JWT',
        expiresAt: 1234,
        user,
      };

      const action = AuthActions.clearAuthUser();
      const result = authReducer(state, action);
      expect(result).toMatchSnapshot();
    });
  });
});
