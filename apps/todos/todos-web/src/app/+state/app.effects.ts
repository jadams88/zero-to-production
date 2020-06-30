import { Injectable } from '@angular/core';
import { Actions, ofType, createEffect } from '@ngrx/effects';
import { AuthActions } from '@ztp/common/auth/data-access';
import { tap } from 'rxjs/operators';
import { GraphQLService } from '@ztp/common/data-access';
import { Router } from '@angular/router';
import { NotificationService } from '@ztp/common/utils/notifications';

@Injectable()
export class AppEffects {
  loginRedirects$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(AuthActions.loginRedirect),
        tap((action) => this.router.navigate(['home']))
      ),
    { dispatch: false }
  );

  registerRedirect$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(AuthActions.registerRedirect),
        tap((action) => this.router.navigate(['register']))
      ),
    { dispatch: false }
  );

  logoutRedirect$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(AuthActions.logoutRedirect),
        tap((action) => {
          this.graphQl.getClient().clearStore();
          this.graphQl.getClient().cache.reset();
        }),
        tap((action) => this.router.navigate(['login']))
      ),
    { dispatch: false }
  );

  loginFailure$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(AuthActions.loginFailure),
        tap(() =>
          this.ns.emit('Provided credentials are incorrect. Please Try Again')
        )
      ),
    { dispatch: false }
  );

  registerSuccess$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(AuthActions.registerSuccess),
        tap(() => this.ns.emit('Registration Successful. Please log in.'))
      ),
    { dispatch: false }
  );

  constructor(
    private actions$: Actions,
    private router: Router,
    private graphQl: GraphQLService,
    private ns: NotificationService
  ) {}
}
