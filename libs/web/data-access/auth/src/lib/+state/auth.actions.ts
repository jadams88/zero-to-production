import { createAction, props } from '@ngrx/store';
import {
  ILoginCredentials,
  ILoginResponse,
  IRegistrationDetails,
  IUser
} from '@ngw/types';

export const loginRedirect = createAction('[Auth] Login Redirect');

export const logoutRedirect = createAction('[Auth] Logout Redirect');

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

export const usernamePending = createAction('[Auth/API] Username Pending');

export const usernameAvailable = createAction('[Auth/API] Username Available');

export const usernameUnAvailable = createAction(
  '[Auth/API] Username UnAvailable'
);

export const clearAvailability = createAction('[Auth/Api] Username Clear');

export const logout = createAction('[Auth] Logout');
