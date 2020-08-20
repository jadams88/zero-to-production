import { Injectable } from '@angular/core';
import { Actions, ofType, createEffect } from '@ngrx/effects';
import { AuthActions } from '@ztp/common/auth/data-access';
import { tap } from 'rxjs/operators';
import { NotificationService } from '@ztp/common/utils/notifications';

@Injectable()
export class AppEffects {
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

  constructor(private actions$: Actions, private ns: NotificationService) {}
}
