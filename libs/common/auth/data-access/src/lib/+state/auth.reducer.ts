import { createReducer, on, Action } from '@ngrx/store';
import * as fromAuth from './auth.actions';
import { IUser } from '@ztp/data';

export const authStateKey = 'authStateKey';

export interface AuthState {
  isAuthenticated: boolean;
  expiresAt: number | null;
  user: IUser | null;
}

export const initialState: AuthState = {
  isAuthenticated: false,
  expiresAt: null,
  user: null,
};

const authReducer = createReducer(
  initialState,
  on(fromAuth.loginSuccess, (state, { expiresIn }) => {
    return {
      ...state,
      isAuthenticated: true,
      expiresAt: new Date().valueOf() + expiresIn * 1000, // expiresIn will be in seconds -> convert to millis
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
    return { ...state, isAuthenticated: false, user: null };
  })
);

export function reducer(state: AuthState | undefined, action: Action) {
  return authReducer(state, action);
}
