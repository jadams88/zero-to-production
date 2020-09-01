import { TestBed } from '@angular/core/testing';
import {
  HTTP_INTERCEPTORS,
  HttpClient,
  HttpRequest,
} from '@angular/common/http';
import {
  HttpTestingController,
  HttpClientTestingModule,
} from '@angular/common/http/testing';
import { AuthFacade } from '../+state/auth.facade';
import { Type } from '@angular/core';
import { SilentRefreshInterceptor } from './silent-refresh-interceptor';
import { AuthService } from '../services/auth.service';
import { of, throwError } from 'rxjs';
import { AUTH_SERVER_URL } from '../tokens/tokens';

describe('SilentRefreshInterceptor', () => {
  const AUTH_URL = 'http://auth.com';
  let interceptor: SilentRefreshInterceptor;
  let httpClient: HttpClient;
  let httpTestingController: HttpTestingController;
  let authFacade: AuthFacade;
  let authService: AuthService;
  const authServiceSpy = {
    refreshAccessToken: jest.fn(),
  };
  const authFacadeSpy = {
    logout: jest.fn(),
    setAuthenticated: jest.fn(),
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        {
          provide: HTTP_INTERCEPTORS,
          useClass: SilentRefreshInterceptor,
          multi: true,
        },
        { provide: AuthFacade, useValue: authFacadeSpy },
        { provide: AuthService, useValue: authServiceSpy },
        { provide: AUTH_SERVER_URL, useValue: AUTH_URL },
      ],
    });

    interceptor = TestBed.inject(SilentRefreshInterceptor);
    httpClient = TestBed.inject<HttpClient>(HttpClient);
    httpTestingController = TestBed.inject(
      HttpTestingController as Type<HttpTestingController>
    );
    authFacade = TestBed.inject<AuthFacade>(AuthFacade);
    authService = TestBed.inject(AuthService);
  });

  describe('shouldNotRetryRequest', () => {
    it('should return true if request is GraphQL authorize', () => {
      const req = ({
        url: `${AUTH_URL}/graphql`,
        body: {
          operationName: 'Authorize',
        },
      } as any) as HttpRequest<any>;

      const result = interceptor.shouldNotRetryRequest(req);
      expect(result).toBe(true);
    });

    it('should return true if request is to refresh or revoke the access token', () => {
      const req1 = ({
        url: `${AUTH_URL}/authorize/refresh`,
      } as any) as HttpRequest<any>;
      const req2 = ({
        url: `${AUTH_URL}/authorize/revoke`,
      } as any) as HttpRequest<any>;

      const result = interceptor.shouldNotRetryRequest(req1);
      const result2 = interceptor.shouldNotRetryRequest(req2);
      expect(result).toBe(true);
      expect(result2).toBe(true);
    });
    it('should return false for all other request', () => {
      const req1 = ({
        url: `${AUTH_URL}/test`,
      } as any) as HttpRequest<any>;
      const req2 = ({
        url: `${AUTH_URL}/another-test`,
      } as any) as HttpRequest<any>;

      const result = interceptor.shouldNotRetryRequest(req1);
      const result2 = interceptor.shouldNotRetryRequest(req2);
      expect(result).toBe(false);
      expect(result2).toBe(false);
    });
  });

  describe('intercept', () => {
    it('should not log the user out if the response is not a 401 (Unauthorized)', () => {
      const spy = jest.spyOn(authFacade, 'logout');

      // Make an HTTP GET request, don't care about the response
      httpClient.get('/test').subscribe((data) => {});

      const req = httpTestingController.expectOne('/test');

      // Set the response to be a 401
      req.flush({}, { status: 200, statusText: 'Ok' });

      // // Assert the logout wad not called
      expect(spy).not.toHaveBeenCalled();

      httpTestingController.verify();
      spy.mockClear();
    });

    it('should try and refresh access token if the response status 401', () => {
      const spy = jest.spyOn(authService, 'refreshAccessToken');

      // Make an HTTP GET request, don't care about the response
      httpClient.get('/test').subscribe((data) => {
        console.log(data);
      });

      const req = httpTestingController.expectOne('/test');

      // Set the response to be a 401
      req.flush({}, { status: 401, statusText: 'Unauthorized' });

      // Assert the logout wat not called
      expect(spy).toHaveBeenCalled();

      httpTestingController.verify();

      spy.mockClear();
    });

    it('should set the authenticated state if access token is refreshed', () => {
      authService.refreshAccessToken = jest.fn(() =>
        of({ token: 'TOKEN', expiresIn: 123 })
      );

      const spy = jest.spyOn(authFacade, 'setAuthenticated');

      // Make an HTTP GET request, don't care about the response
      httpClient.get('/test').subscribe((data) => {
        console.log(data);
      });

      const req = httpTestingController.expectOne('/test');

      // Set the response to be a 401
      req.flush({}, { status: 401, statusText: 'Unauthorized' });

      // two request happen
      const req2 = httpTestingController.expectOne('/test');

      // Assert the logout wat not called
      expect(spy).toHaveBeenCalled();
      expect(spy).toHaveBeenCalledWith({ token: 'TOKEN', expiresIn: 123 });

      httpTestingController.verify();

      spy.mockClear();
    });

    it('should retry the request if the token is refreshed', () => {
      const TOKEN = '1234';

      authService.refreshAccessToken = jest.fn(() =>
        of({ token: TOKEN, expiresIn: 123 })
      );

      // Make an HTTP GET request, don't care about the response
      httpClient.get('/test').subscribe((data) => {
        console.log(data);
      });

      const req = httpTestingController.expectOne('/test');

      // Set the response to be a 401
      req.flush({}, { status: 401, statusText: 'Unauthorized' });

      // two request happen
      const req2 = httpTestingController.expectOne('/test');

      expect(req2.request.headers.get('Authorization')).toBeTruthy();
      expect(req2.request.headers.get('Authorization')).toEqual(
        `Bearer ${TOKEN}`
      );

      httpTestingController.verify();
    });

    it('should call facade.logout() if the refresh token fails', () => {
      authService.refreshAccessToken = jest.fn(() =>
        of({ token: null, expiresIn: null })
      );

      const spy2 = jest.spyOn(authFacade, 'logout');
      const spy = jest.spyOn(authFacade, 'setAuthenticated');

      spy.mockClear();
      expect(spy).not.toHaveBeenCalled();

      // Make an HTTP GET request, don't care about the response
      httpClient.get('/test').subscribe((data) => {
        console.log(data);
      });

      const req = httpTestingController.expectOne('/test');

      // Set the response to be a 401
      req.flush({}, { status: 401, statusText: 'Unauthorized' });

      expect(spy).not.toHaveBeenCalled();
      expect(spy2).toHaveBeenCalled();

      httpTestingController.verify();

      spy.mockClear();
      spy2.mockClear();
    });

    it('should not try and refresh the access token if 401 status is received on login attempt', () => {
      const spy = jest.spyOn(authService, 'refreshAccessToken');

      const body = { operationName: 'Authorize' };
      // Make an HTTP GET request, don't care about the response
      httpClient.post(`${AUTH_URL}/graphql`, body).subscribe((data) => {
        console.log(data);
      });

      const req = httpTestingController.expectOne(`${AUTH_URL}/graphql`);

      // Set the response to be a 401
      req.flush({}, { status: 401, statusText: 'Unauthorized' });

      expect(spy).not.toHaveBeenCalled();

      httpTestingController.verify();

      spy.mockClear();
    });
  });
});
