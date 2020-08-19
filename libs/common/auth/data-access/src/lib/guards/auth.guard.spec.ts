import { TestBed } from '@angular/core/testing';
import { AuthGuard } from './auth.guard';
import { AuthService } from '../services/auth.service';
import { AuthFacade } from '../+state/auth.facade';
import { of } from 'rxjs';
import { cold } from 'jest-marbles';
import { Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';

describe('AuthGuard', () => {
  let authGuard: AuthGuard;
  let router: Router;
  let authFacade: AuthFacade;

  const authFacadeSpy = { logout: jest.fn(), authenticated$: of(jest.fn()) };

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [RouterTestingModule],
      providers: [AuthGuard, { provide: AuthFacade, useValue: authFacadeSpy }],
    });

    authGuard = TestBed.inject<AuthGuard>(AuthGuard);
    authFacade = TestBed.inject<AuthFacade>(AuthFacade);
    router = TestBed.inject(Router);
  });

  it('should allow access if the user is authenticated', () => {
    authFacade.authenticated$ = of(true);

    const completion = cold('(a|)', { a: true });

    expect(authGuard.canActivate()).toBeObservable(completion);
  });

  // it('should redirect to login if the user is unauthenticated', () => {
  //   authFacade.authenticated$ = of(false);
  //   const urlTree = router.parseUrl('login');

  //   const completion = cold('(a|)', { a: urlTree });

  //   expect(authGuard.canActivate()).toBeObservable(completion);
  // });
});
