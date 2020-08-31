import { createReducer, on, Action } from '@ngrx/store';
import * as fromAuth from './auth.actions';
import { IUser } from '@ztp/data';

export const authStateKey = 'authStateKey';

export interface AuthState {
  init: boolean;
  accessToken: string | null;
  authenticated: boolean;
  expiresAt: number | null;
  user: IUser | null;
}

export const initialState: AuthState = {
  init: false,
  accessToken: null,
  authenticated: false,
  expiresAt: null,
  user: null,
};

const authReducer = createReducer(
  initialState,
  on(
    fromAuth.loginSuccess,
    fromAuth.setAuthenticated,
    (state, { token, expiresIn }) => {
      return {
        init: true,
        user: null,
        accessToken: token,
        authenticated: true,
        expiresAt: new Date().valueOf() + expiresIn * 1000, // expiresIn will be in seconds -> convert to millis
      };
    }
  ),
  on(fromAuth.logout, (state) => {
    return {
      init: true,
      expiresAt: null,
      authenticated: false,
      user: null,
      accessToken: null,
    };
  }),
  on(fromAuth.loadAuthUserSuccess, (state, { user }) => {
    return { ...state, user };
  }),
  on(fromAuth.clearAuthUser, (state) => {
    return { ...state, user: null };
  })
);

export function reducer(state: AuthState | undefined, action: Action) {
  return authReducer(state, action);
}
