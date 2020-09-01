import { Injectable } from '@angular/core';
import { Store, select } from '@ngrx/store';
import { Observable } from 'rxjs';
import { IUser } from '@ztp/data';
import * as AuthActions from './auth.actions';
import * as fromAuth from './auth.selectors';
import { ILoginCredentials, IRegistrationDetails } from '../auth.interface';

@Injectable({ providedIn: 'root' })
export class AuthFacade {
  accessToken$: Observable<string | null>;
  expiresAt$: Observable<number | null>;
  authenticated$: Observable<boolean>;
  user$: Observable<IUser | null>;

  constructor(private store: Store<any>) {
    this.accessToken$ = this.store.pipe(select(fromAuth.selectAccessToken));
    this.expiresAt$ = this.store.pipe(select(fromAuth.selectExpiresAt));
    this.authenticated$ = this.store.pipe(select(fromAuth.selectAuthenticated));
    this.user$ = this.store.pipe(select(fromAuth.selectAuthUser));
  }

  login(credentials: ILoginCredentials): void {
    this.store.dispatch(AuthActions.login(credentials));
  }

  register(userDetails: IRegistrationDetails) {
    this.store.dispatch(AuthActions.register({ details: userDetails }));
  }

  logout(): void {
    this.store.dispatch(AuthActions.logout());
  }

  loadLoggedInUser(): void {
    this.store.dispatch(AuthActions.loadAuthUser());
  }

  setAuthenticated(auth: { token: string; expiresIn: number }) {
    this.store.dispatch(AuthActions.setAuthenticated(auth));
  }
}
