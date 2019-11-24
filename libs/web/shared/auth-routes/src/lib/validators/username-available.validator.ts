import { Injectable } from '@angular/core';
import {
  AsyncValidator,
  AbstractControl,
  ValidationErrors
} from '@angular/forms';
import { Observable, of, timer } from 'rxjs';
import { map, catchError, tap, switchMap, take } from 'rxjs/operators';
import { AuthService, AuthFacade } from '@ngw/data-access/auth';

@Injectable()
export class UsernameAvailableValidator implements AsyncValidator {
  constructor(private auth: AuthService, private facade: AuthFacade) {}

  validate(ctrl: AbstractControl): Observable<ValidationErrors | null> {
    // Don't need to worry about using takeUntil(ctrl.valueChanges)
    // because the form unsubscribes when the ctrl value changes
    return timer(200).pipe(
      tap(() => this.facade.usernamePending()),
      take(1),
      switchMap(() => this.auth.isUsernameAvailable(ctrl.value)),
      tap(({ isAvailable }) => {
        // Set to available or not
        isAvailable
          ? this.facade.usernameAvailable()
          : this.facade.usernameUnAvailable();
      }),
      map(({ isAvailable }) => (isAvailable ? null : { notAvailable: true })),
      catchError(() => of(null))
    );
  }
}
