import { Injectable } from '@angular/core';
import { map, tap } from 'rxjs/operators';
import { Actions, Effect, ofType } from '@ngrx/effects';
import { NotificationService } from '@ngw/utils/notifications';
import * as ErrorActions from './error.actions';

@Injectable()
export class ErrorEffects {
  constructor(private actions$: Actions, private ns: NotificationService) {}

  @Effect({ dispatch: false })
  httpError$ = this.actions$.pipe(
    ofType(ErrorActions.httpErrorAction),
    tap(() => this.ns.emit('An error has occurred.')),
    map(console.error)
  );
}
