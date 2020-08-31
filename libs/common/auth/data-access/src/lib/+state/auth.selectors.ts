import { createFeatureSelector, createSelector } from '@ngrx/store';
import * as fromAuth from './auth.reducer';

export const selectAuthSate = createFeatureSelector<fromAuth.AuthState>(
  fromAuth.authStateKey
);

export const selectInit = createSelector(selectAuthSate, (state) => state.init);

export const selectAuthenticated = createSelector(
  selectAuthSate,
  (state) => state.authenticated
);

export const selectAccessToken = createSelector(
  selectAuthSate,
  (state) => state.accessToken
);

export const selectExpiresAt = createSelector(
  selectAuthSate,
  (state) => state.expiresAt
);

export const selectAuthUser = createSelector(
  selectAuthSate,
  (state) => state.user
);
