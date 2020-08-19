import { Injectable } from '@angular/core';
import { CanActivate, UrlTree, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { AuthFacade } from '../+state/auth.facade';

@Injectable({ providedIn: 'root' })
export class AuthGuard implements CanActivate {
  constructor(private facade: AuthFacade, private router: Router) {}

  canActivate(): Observable<boolean | UrlTree> {
    return this.facade.authenticated$.pipe(
      map((loggedIn) => (loggedIn ? loggedIn : this.router.parseUrl('login')))
    );
  }
}
