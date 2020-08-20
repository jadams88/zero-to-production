import { InjectionToken } from '@angular/core';

export const AUTH_SERVER_URL = new InjectionToken<string>(
  'forRoot() Auth Server Url'
);

export const LOGIN_PAGE = new InjectionToken<string>('Login Page Path');

export const LOGIN_REDIRECT = new InjectionToken<string>('Login Redirect Path');

export const REGISTER_PAGE = new InjectionToken<string>('Register Page Path');
