import { TestBed } from '@angular/core/testing';
import { Observable } from 'rxjs';
import { Actions } from '@ngrx/effects';
import { hot, Scheduler } from 'jest-marbles';
import { provideMockActions } from '@ngrx/effects/testing';
import { createSpyObj } from '@ztp/tests/client';
import { AppEffects } from './app.effects';
import { NotificationService } from '@ztp/common/utils/notifications';
import { loginFailure, registerSuccess } from '@ztp/common/auth/data-access';

describe('AppEffects', () => {
  let effects: AppEffects;
  let actions$: Observable<any>;
  let ns: NotificationService;
  const nsSpy = createSpyObj('NotificationService', ['emit']);

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        AppEffects,
        { provide: NotificationService, useValue: nsSpy },
        provideMockActions(() => actions$),
      ],
    });

    effects = TestBed.inject<AppEffects>(AppEffects);
    actions$ = TestBed.inject<Actions>(Actions);
    ns = TestBed.inject<NotificationService>(NotificationService);
  });

  describe('loginFailure$', () => {
    it('should notify the user of login failure', () => {
      const spy = jest.spyOn(ns, 'emit');
      jest.resetAllMocks();

      const action = loginFailure({ error: 'Nope!!' });

      actions$ = hot('-a---', { a: action });

      effects.loginFailure$.subscribe();

      Scheduler.get().flush();

      expect(spy).toHaveBeenCalled();
    });
  });

  describe('registerSuccess$', () => {
    it('should notify the user of successful registration', () => {
      const spy = jest.spyOn(ns, 'emit');
      jest.resetAllMocks();
      const action = registerSuccess({ user: {} as any });

      actions$ = hot('-a---', { a: action });

      effects.registerSuccess$.subscribe();

      Scheduler.get().flush();

      expect(spy).toHaveBeenCalled();
    });
  });
});
