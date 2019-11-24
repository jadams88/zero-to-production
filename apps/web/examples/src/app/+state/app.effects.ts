import { Injectable } from '@angular/core';
import { Effect, Actions, ofType } from '@ngrx/effects';
import {
  loginRedirect,
  logoutRedirect,
  registerRedirect
} from '@ngw/data-access/auth';
import { RouterFacade } from '@ngw/data-access/router';
import { tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class AppEffects {
  @Effect({ dispatch: false })
  loginRedirects$ = this.action$.pipe(
    ofType(loginRedirect),
    tap(() =>
      this.routerFacade.go({
        path: ['examples', 'secure', 'home']
      })
    )
  );

  @Effect({ dispatch: false })
  registerRedirect$ = this.action$.pipe(
    ofType(registerRedirect),
    tap(() =>
      this.routerFacade.go({
        path: ['examples', 'secure', 'register']
      })
    )
  );

  @Effect({ dispatch: false })
  logoutRedirect$ = this.action$.pipe(
    ofType(logoutRedirect),
    tap(() =>
      this.routerFacade.go({
        path: ['examples', 'secure', 'login']
      })
    )
  );
  constructor(private action$: Actions, private routerFacade: RouterFacade) {}
}
