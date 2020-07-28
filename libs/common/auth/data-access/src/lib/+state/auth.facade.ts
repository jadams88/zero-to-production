import { Injectable } from '@angular/core';
import { Store, select } from '@ngrx/store';
import { Observable } from 'rxjs';
import { IUser } from '@ztp/data';
import * as AuthActions from './auth.actions';
import * as fromAuth from './auth.selectors';
import { ILoginCredentials, IRegistrationDetails } from '../auth.interface';

@Injectable({ providedIn: 'root' })
export class AuthFacade {
  isAuthenticated$: Observable<boolean>;
  user$: Observable<IUser | null>;

  constructor(private store: Store<any>) {
    this.isAuthenticated$ = this.store.pipe(
      select(fromAuth.selectIsAuthenticated)
    );
    this.user$ = this.store.pipe(select(fromAuth.selectAuthUser));
  }

  login(credentials: ILoginCredentials): void {
    this.store.dispatch(AuthActions.login(credentials));
  }

  register(userDetails: IRegistrationDetails) {
    this.store.dispatch(AuthActions.register({ details: userDetails }));
  }

  loginRedirect(): void {
    this.store.dispatch(AuthActions.loginRedirect());
  }

  registerRedirect(): void {
    this.store.dispatch(AuthActions.registerRedirect());
  }

  logout(): void {
    this.store.dispatch(AuthActions.logout());
  }

  loadLoggedInUser(): void {
    this.store.dispatch(AuthActions.loadAuthUser());
  }

  setAuthenticated(isAuthenticated: boolean, expiresAt: number | null) {
    this.store.dispatch(
      AuthActions.setAuthenticated({ isAuthenticated, expiresAt })
    );
  }
}
