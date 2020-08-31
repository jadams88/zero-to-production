import { Injectable, Optional, Inject } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { of } from 'rxjs';
import { exhaustMap, map, catchError, switchMap, tap } from 'rxjs/operators';
import { Actions, ofType, createEffect } from '@ngrx/effects';
import { IUser } from '@ztp/data';
import * as AuthActions from './auth.actions';
import { AuthService } from '../services/auth.service';
import { ILoginResponse } from '../auth.interface';
import { AuthFacade } from './auth.facade';
import { Router } from '@angular/router';
import { LOGIN_PAGE, LOGIN_REDIRECT } from '../tokens/tokens';

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

  loginSuccess$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(AuthActions.loginSuccess),
        tap(() => this.router.navigate([this.loginRedirect]))
      ),
    { dispatch: false }
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

  registerSuccess$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(AuthActions.registerSuccess),
        tap((action) => this.router.navigate([this.loginPage]))
      ),
    { dispatch: false }
  );

  logout$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(AuthActions.logout),
        switchMap(() =>
          this.authService
            .revokeRefreshToken()
            .pipe(catchError((e) => of({ success: false })))
        ),
        tap(() => this.router.navigate([this.loginPage]))
      ),
    { useEffectsErrorHandler: false, dispatch: false }
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
    private facade: AuthFacade,
    private router: Router,
    @Optional() @Inject(LOGIN_PAGE) private loginPage: string,
    @Optional() @Inject(LOGIN_REDIRECT) private loginRedirect: string
  ) {
    this.loginPage = loginPage ? loginPage : '/login';
    this.loginRedirect = loginRedirect ? loginRedirect : '/home';
  }
}
