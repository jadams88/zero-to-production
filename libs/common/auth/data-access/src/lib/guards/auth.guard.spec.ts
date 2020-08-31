import { TestBed } from '@angular/core/testing';
import { AuthGuard } from './auth.guard';
import { AuthService } from '../services/auth.service';
import { AuthFacade } from '../+state/auth.facade';
import { of } from 'rxjs';
import { cold } from 'jest-marbles';
import { Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { LOGIN_PAGE } from '../tokens/tokens';

describe('AuthGuard', () => {
  let authGuard: AuthGuard;
  let router: Router;
  let authFacade: AuthFacade;
  let authService: AuthService;

  const authFacadeSpy = {
    logout: jest.fn(),
    authenticated$: jest.fn(),
    init$: jest.fn(),
  };

  const authServiceSpy = {
    initLogin: jest.fn(),
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [RouterTestingModule],
      providers: [
        AuthGuard,
        { provide: AuthFacade, useValue: authFacadeSpy },
        { provide: AuthService, useValue: authServiceSpy },
        { provide: LOGIN_PAGE, useValue: '/test/login' },
      ],
    });

    authGuard = TestBed.inject<AuthGuard>(AuthGuard);
    authFacade = TestBed.inject<AuthFacade>(AuthFacade);
    authService = TestBed.inject(AuthService);
    router = TestBed.inject(Router);
  });

  it('should allow access if the user has logged in and is authenticated', () => {
    authFacade.init$ = of(true);
    authFacade.authenticated$ = of(true);

    const completion = cold('(a|)', { a: true });

    expect(authGuard.canActivate()).toBeObservable(completion);
  });

  it('should redirect to login if the user is not authenticated', () => {
    authFacade.init$ = of(true);
    authFacade.authenticated$ = of(false);

    const url = router.parseUrl('/test/login');

    const completion = cold('(a|)', { a: url });

    expect(authGuard.canActivate()).toBeObservable(completion);
  });

  // it('should redirect to login if the user is unauthenticated', () => {
  //   authFacade.authenticated$ = of(false);
  //   const urlTree = router.parseUrl('login');

  //   const completion = cold('(a|)', { a: urlTree });

  //   expect(authGuard.canActivate()).toBeObservable(completion);
  // });
});
