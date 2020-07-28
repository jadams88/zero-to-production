import { createFeatureSelector, createSelector } from '@ngrx/store';
import * as fromAuth from './auth.reducer';

export const selectAuthSate = createFeatureSelector<fromAuth.AuthState>(
  fromAuth.authStateKey
);

export const selectIsAuthenticated = createSelector(
  selectAuthSate,
  (state) => state.isAuthenticated
);

export const selectAuthUser = createSelector(
  selectAuthSate,
  (state) => state.user
);
