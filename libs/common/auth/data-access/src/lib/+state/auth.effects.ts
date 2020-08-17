import { Injectable } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { of } from 'rxjs';
import { exhaustMap, map, catchError, switchMap } from 'rxjs/operators';
import { Actions, ofType, createEffect } from '@ngrx/effects';
import { IUser } from '@ztp/data';
import * as AuthActions from './auth.actions';
import { AuthService } from '../services/auth.service';
import { ILoginResponse } from '../auth.interface';
import { AuthFacade } from './auth.facade';

@Injectable()
export class AuthEffects {
  login$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(AuthActions.login),
        exhaustMap((credentials) =>
          // Note that when using GraphQL as a login option,
          // Any errors will not be errors in the HTTP request (will be status 200)
          // But rather an array on the result.errors property
          this.authService.login(credentials).pipe(
            map(({ errors, data }) =>
              errors
                ? AuthActions.loginFailure({ error: errors[0].message })
                : AuthActions.loginSuccess(
                    (data as { authorize: ILoginResponse }).authorize
                  )
            ),
            catchError((error: HttpErrorResponse) =>
              of(AuthActions.loginFailure({ error: error.message }))
            )
          )
        )
      ),
    // Errors are handled and it is safe to disable resubscription
    { useEffectsErrorHandler: false }
  );

  isLoggedIn$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AuthActions.isLoggedIn),
      switchMap(() =>
        this.authService.refreshAccessToken().pipe(
          map((res) => AuthActions.setAuthenticated(res)),
          catchError((e) => of(AuthActions.isLoggedFail()))
        )
      )
    )
  );

  loginSuccess$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AuthActions.loginSuccess),
      map(() => AuthActions.loginRedirect())
    )
  );

  register$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(AuthActions.register),
        exhaustMap(({ details }) =>
          this.authService.register(details).pipe(
            map(({ errors, data }) =>
              errors
                ? AuthActions.registerFailure({ error: errors[0].message })
                : AuthActions.registerSuccess({
                    user: (data as { register: IUser }).register,
                  })
            ),
            catchError((error: HttpErrorResponse) =>
              of(AuthActions.registerFailure({ error: error.message }))
            )
          )
        )
      ),
    { useEffectsErrorHandler: false }
  );

  registerSuccess$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AuthActions.registerSuccess),
      map(() => AuthActions.logoutRedirect())
    )
  );

  logout$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(AuthActions.logout),
        switchMap(() =>
          this.authService.revokeRefreshToken().pipe(
            map(() => AuthActions.logoutRedirect()),
            catchError((e) => of(AuthActions.logoutRedirect()))
          )
        )
      ),
    { useEffectsErrorHandler: false }
  );

  loadAuthUser$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(AuthActions.loadAuthUser),
        switchMap(() => this.facade.accessToken$),
        map((token) => this.authService.decodeToken(token)),
        switchMap((id) => {
          if (!id) {
            return of(
              AuthActions.loadAuthUserFail({ error: 'User is not logged in' })
            );
          } else {
            return this.authService.loadUser(id).pipe(
              map(({ errors, data }) =>
                errors
                  ? AuthActions.loadAuthUserFail({ error: errors[0].message })
                  : AuthActions.loadAuthUserSuccess({
                      user: (data as { User: IUser }).User,
                    })
              ),
              catchError((error: HttpErrorResponse) =>
                of(AuthActions.loadAuthUserFail({ error: error.message }))
              )
            );
          }
        })
      ),
    { useEffectsErrorHandler: false }
  );

  clearAuthenticatedUser$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AuthActions.logout),
      map(() => AuthActions.clearAuthUser())
    )
  );

  constructor(
    private actions$: Actions,
    private authService: AuthService,
    private facade: AuthFacade
  ) {}
}
