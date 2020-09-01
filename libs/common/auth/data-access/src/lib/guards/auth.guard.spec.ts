import { TestBed } from '@angular/core/testing';
import { AuthGuard } from './auth.guard';
import { AuthService } from '../services/auth.service';
import { AuthFacade } from '../+state/auth.facade';
import { of } from 'rxjs';
import { TestScheduler } from 'rxjs/testing';
import { cold, hot } from 'jest-marbles';
import { Router, UrlTree } from '@angular/router';
import { LOGIN_PAGE } from '../tokens/tokens';
import { delay } from 'rxjs/operators';

describe('AuthGuard', () => {
  let authGuard: AuthGuard;
  let router: Router;
  let authFacade: AuthFacade;
  let authService: AuthService;

  const authFacadeSpy = {
    logout: jest.fn(),
    authenticated$: jest.fn(),
  };

  const authServiceSpy = {
    initLogin: jest.fn(),
  };

  const routerSpy = {
    parseUrl: jest.fn(),
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        AuthGuard,
        { provide: AuthFacade, useValue: authFacadeSpy },
        { provide: AuthService, useValue: authServiceSpy },
        { provide: LOGIN_PAGE, useValue: '/test/login' },
        { provide: Router, useValue: routerSpy },
      ],
    });

    authGuard = TestBed.inject<AuthGuard>(AuthGuard);
    authFacade = TestBed.inject<AuthFacade>(AuthFacade);
    authService = TestBed.inject(AuthService);
    router = TestBed.inject(Router);
  });

  it('should allow access if the user has logged in and is authenticated', () => {
    authService.initLogin = jest.fn(() =>
      of({ token: 'TOKEN', expiresIn: 1234 })
    );
    authFacade.authenticated$ = of(true);
    // call once so not first run
    authGuard.canActivate();

    const completion = cold('(a|)', { a: true });

    expect(authGuard.canActivate()).toBeObservable(completion);
  });

  it('should redirect to login if the user is not authenticated', () => {
    authService.initLogin = jest.fn(() =>
      of({ token: 'TOKEN', expiresIn: 1234 })
    );
    authFacade.authenticated$ = of(false);
    // call once so not first run
    authGuard.canActivate();

    const parsedUrl = ({ url: '/test/login' } as unknown) as UrlTree;

    router.parseUrl = jest.fn((url: string) => parsedUrl);

    const completion = cold('(a|)', { a: parsedUrl });

    expect(authGuard.canActivate()).toBeObservable(completion);
  });

  it('should try and refresh access token if first run', () => {
    authService.initLogin = jest.fn(() => of({ token: null, expiresIn: null }));
    const spy = jest.spyOn(authService, 'initLogin');

    // run the auth guard once
    authGuard.canActivate();
    expect(spy).toHaveBeenCalled();
  });

  it('should return true if refresh was successful', () => {
    authService.initLogin = jest.fn(() =>
      of({ token: 'TOKEN', expiresIn: 123 })
    );

    const completion = cold('(a|)', { a: true });

    expect(authGuard.canActivate()).toBeObservable(completion);
  });

  it('should redirect to login if refresh was unsuccessful', () => {
    authService.initLogin = jest.fn(() => of({ token: null, expiresIn: null }));

    const parsedUrl = ({ url: '/test/login' } as unknown) as UrlTree;
    router.parseUrl = jest.fn((url: string) => parsedUrl);

    const completion = cold('(a|)', { a: parsedUrl });

    expect(authGuard.canActivate()).toBeObservable(completion);
  });

  it('should redirect to login if refresh throws', () => {
    const parsedUrl = ({ url: '/test/login' } as unknown) as UrlTree;
    router.parseUrl = jest.fn((url: string) => parsedUrl);

    const initLogin = hot('(--#|)', null, 'some error');
    const completion = cold('(--a|)', { a: parsedUrl });
    authService.initLogin = jest.fn(() => initLogin);

    expect(authGuard.canActivate()).toBeObservable(completion);
  });

  it('should redirect to login if refresh times out', () => {
    const scheduler = new TestScheduler((actual, expected) => {
      expect(actual).toEqual(expected);
    });

    scheduler.run((helpers) => {
      const parsedUrl = ({ url: '/test/login' } as unknown) as UrlTree;
      router.parseUrl = jest.fn((url: string) => parsedUrl);

      authService.initLogin = jest.fn(() =>
        of({ token: 'TOKEN', expiresIn: 1234 }).pipe(delay(1000, scheduler))
      );

      scheduler.expectObservable(authGuard.canActivate()).toBe('500ms (a|)', {
        a: parsedUrl,
      });
    });
  });
});
