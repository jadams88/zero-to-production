import { Injectable, Inject, Optional } from '@angular/core';
import { CanActivate, UrlTree, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { AuthFacade } from '../+state/auth.facade';
import { LOGIN_PAGE } from '../tokens/tokens';

@Injectable({ providedIn: 'root' })
export class AuthGuard implements CanActivate {
  constructor(
    private facade: AuthFacade,
    private router: Router,
    @Optional() @Inject(LOGIN_PAGE) private login: string
  ) {
    this.login = login ? login : '/login';
  }

  canActivate(): Observable<boolean | UrlTree> {
    return this.facade.authenticated$.pipe(
      map((loggedIn) =>
        loggedIn ? loggedIn : this.router.parseUrl(this.login)
      )
    );
  }
}
