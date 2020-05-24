import { createAction, props } from '@ngrx/store';
import { IUser } from '@ztp/data';
import {
  ILoginCredentials,
  ILoginResponse,
  IRegistrationDetails,
} from '../auth.interface';

export const loginRedirect = createAction('[Auth] Login Redirect');

export const registerRedirect = createAction('[Auth] Register Redirect');

export const login = createAction(
  '[Auth/API] Login',
  props<ILoginCredentials>()
);

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
  props<{ isAuthenticated: boolean; expiresAt: number | null }>()
);

export const usernamePending = createAction('[Auth/API] Username Pending');

export const userAvailable = createAction(
  '[Auth/API] Username Available',
  props<{ isAvailable: boolean }>()
);

export const clearAvailable = createAction('[Auth/Api] Username Clear');

export const logout = createAction('[Auth] Logout');

export const logoutRedirect = createAction('[Auth] Logout Redirect');

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
