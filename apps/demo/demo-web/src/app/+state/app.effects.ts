import { Injectable } from '@angular/core';
import { tap } from 'rxjs/operators';
import { createEffect, Actions, ofType } from '@ngrx/effects';
import { NotificationService } from '@ztp/common/utils/notifications';
import { loginFailure, registerSuccess } from '@ztp/common/auth/data-access';

@Injectable({
  providedIn: 'root',
})
export class AppEffects {
  loginFailure$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(loginFailure),
        tap(() =>
          this.ns.emit('Provided credentials are incorrect. Please Try Again')
        )
      ),
    {
      dispatch: false,
    }
  );

  registerSuccess$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(registerSuccess),
        tap(() => this.ns.emit('Registration Successful. Please log in.'))
      ),
    { dispatch: false }
  );

  constructor(private actions$: Actions, private ns: NotificationService) {}
}
