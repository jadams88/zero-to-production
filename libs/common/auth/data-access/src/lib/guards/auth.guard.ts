import { Injectable, Inject, Optional } from '@angular/core';
import { CanActivate, UrlTree, Router } from '@angular/router';
import { Observable, of } from 'rxjs';
import { map, timeout, switchMap, catchError } from 'rxjs/operators';
import { AuthFacade } from '../+state/auth.facade';
import { LOGIN_PAGE } from '../tokens/tokens';
import { AuthService } from '../services/auth.service';

// time in milliseconds
const INITIAL_LOAD_TIMEOUT_TIME = 500;

@Injectable({ providedIn: 'root' })
export class AuthGuard implements CanActivate {
  constructor(
    private facade: AuthFacade,
    private service: AuthService,
    private router: Router,
    @Optional() @Inject(LOGIN_PAGE) private login: string
  ) {
    this.login = login ? login : '/login';
  }

  canActivate(): Observable<boolean | UrlTree> {
    return this.facade.init$.pipe(
      switchMap((init) => {
        if (init) {
          return this.facade.authenticated$.pipe(
            map((loggedIn) =>
              loggedIn ? loggedIn : this.router.parseUrl(this.login)
            )
          );
        } else {
          return this.service.initLogin().pipe(
            timeout(INITIAL_LOAD_TIMEOUT_TIME),
            map(({ token, expiresIn }) => {
              if (token && expiresIn) {
                return true;
              } else {
                return this.router.parseUrl(this.login);
              }
            }),
            catchError((e) => of(this.router.parseUrl(this.login)))
          );
        }
      })
    );
  }
}
