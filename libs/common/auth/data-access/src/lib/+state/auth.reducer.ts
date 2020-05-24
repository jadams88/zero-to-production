import { createReducer, on, Action } from '@ngrx/store';
import * as fromAuth from './auth.actions';
import { IUser } from '@ztp/data';
import { secondsToExpiresAtMillis } from '../utils';

export const authStateKey = 'authStateKey';

export interface AuthState {
  isAuthenticated: boolean;
  expiresAt: number | null;
  user: IUser | null;
  isAvailable: boolean | null | 'pending';
}

export const initialState: AuthState = {
  isAuthenticated: false,
  expiresAt: null,
  user: null,
  isAvailable: null,
};

const authReducer = createReducer(
  initialState,
  on(fromAuth.loginSuccess, (state, { expiresIn }) => {
    return {
      ...state,
      isAuthenticated: true,
      expiresAt: secondsToExpiresAtMillis(expiresIn), // expiresIn will be in seconds
    };
  }),
  on(fromAuth.registerSuccess, (state) => {
    return { ...state, isAvailable: null };
  }),
  on(fromAuth.logout, (state) => {
    return { ...state, isAuthenticated: false };
  }),
  on(fromAuth.setAuthenticated, (state, { isAuthenticated, expiresAt }) => {
    return { ...state, isAuthenticated, expiresAt };
  }),
  on(fromAuth.loadAuthUserSuccess, (state, { user }) => {
    return { ...state, user };
  }),
  on(fromAuth.clearAuthUser, (state) => {
    return { ...state, user: null };
  }),
  on(fromAuth.logout, (state) => {
    return { ...state, isAuthenticated: false };
  }),
  on(fromAuth.usernamePending, (state) => {
    return { ...state, isAvailable: 'pending' as 'pending' };
  }),
  on(fromAuth.userAvailable, (state, { isAvailable }) => {
    return { ...state, isAvailable };
  }),
  on(fromAuth.clearAvailable, (state) => {
    return { ...state, available: null };
  })
);

export function reducer(state: AuthState | undefined, action: Action) {
  return authReducer(state, action);
}
