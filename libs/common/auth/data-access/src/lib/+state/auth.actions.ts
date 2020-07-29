import { createAction, props } from '@ngrx/store';
import { IUser } from '@ztp/data';
import {
  ILoginCredentials,
  ILoginResponse,
  IRegistrationDetails,
} from '../auth.interface';

export const login = createAction(
  '[Auth/API] Login',
  props<ILoginCredentials>()
);

export const isLoggedIn = createAction(
  '[Auth/API] Is Logged In',
  props<{ originalUrl: string }>()
);
// no op action
export const isLoggedFail = createAction('[Auth/API] Is Logged In Fail');

export const loginSuccess = createAction(
  '[Auth/API] Login Success',
  props<ILoginResponse>()
);

export const loginFailure = createAction(
  '[Auth/API] Login Failure',
  props<{ error: string }>()
);

export const register = createAction(
  '[Auth/API] Register',
  props<{ details: IRegistrationDetails }>()
);

export const registerSuccess = createAction(
  '[Auth/API] Register Success',
  props<{ user: IUser }>()
);

export const registerFailure = createAction(
  '[Auth/API] Register Failure',
  props<{ error: string }>()
);

export const setAuthenticated = createAction(
  '[Auth] Set Authenticated',
  props<{ expiresIn: number; token: string; navigate?: string }>()
);

export const logout = createAction('[Auth] Logout');
export const logoutSuccess = createAction('[Auth] Logout Success');

export const clearAuthUser = createAction('[Auth] Clear User');

export const loadAuthUser = createAction('[Auth/API] Load User');

export const loadAuthUserSuccess = createAction(
  '[Auth/API] Load User Success',
  props<{ user: IUser }>()
);

export const loadAuthUserFail = createAction(
  '[Auth/API] Load User Fail',
  props<{ error: string }>()
);
