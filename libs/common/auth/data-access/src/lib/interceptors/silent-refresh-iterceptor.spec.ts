import { TestBed } from '@angular/core/testing';
import { HTTP_INTERCEPTORS, HttpClient } from '@angular/common/http';
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
  let httpClient: HttpClient;
  let httpTestingController: HttpTestingController;
  let authFacade: AuthFacade;
  const authFacadeSpy = { logout: jest.fn() };
  let authService: AuthService;
  const authServiceSpy = {
    refreshAccessToken: jest.fn(),
    setSession: jest.fn(),
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
        { provide: AUTH_SERVER_URL, useValue: 'http://auth.com' },
      ],
    });

    httpClient = TestBed.inject<HttpClient>(HttpClient);
    httpTestingController = TestBed.inject(
      HttpTestingController as Type<HttpTestingController>
    );
    authFacade = TestBed.inject<AuthFacade>(AuthFacade);
    authService = TestBed.inject(AuthService);
  });

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

  // it('should try and refresh access token if the response status 401', () => {
  //   const spy = jest
  //     .spyOn(authService, 'refreshAccessToken')
  //     .mockReturnValueOnce(of({ token: '1234', expiresIn: 123 }));

  //   // Make an HTTP GET request, don't care about the response
  //   httpClient.get('/test').subscribe((data) => {
  //     console.log(data);
  //   });

  //   const req = httpTestingController.expectOne('/test');

  //   // Set the response to be a 401
  //   req.flush({}, { status: 401, statusText: 'Unauthorized' });

  //   // two request happen
  //   // const req2 = httpTestingController.expectOne('/test');

  //   // Assert the logout wat not called
  //   expect(spy).toHaveBeenCalled();

  //   httpTestingController.verify();
  //   spy.mockClear();
  // });

  // // it('should set a new session if access token is refreshed', () => {
  // //   const TOKEN = '1234';
  // //   const spy = jest
  // //     .spyOn(authService, 'refreshAccessToken')
  // //     .mockReturnValueOnce(of({ token: TOKEN, expiresIn: 123 }));

  // //   const spy2 = jest.spyOn(authService, 'setSession');

  // //   // Make an HTTP GET request, don't care about the response
  // //   httpClient.get('/test').subscribe((data) => {
  // //     console.log(data);
  // //   });

  // //   const req = httpTestingController.expectOne('/test');

  // //   // Set the response to be a 401
  // //   req.flush({}, { status: 401, statusText: 'Unauthorized' });

  // //   // two request happen
  // //   const req2 = httpTestingController.expectOne('/test');

  // //   // Assert the logout wat not called
  // //   expect(spy2).toHaveBeenCalled();
  // //   expect(spy2).toHaveBeenCalledWith({ token: TOKEN, expiresIn: 123 });

  // //   httpTestingController.verify();
  // //   spy.mockClear();
  // //   spy2.mockClear();
  // // });

  // it('should retry the request if the token is refreshed', () => {
  //   const TOKEN = '1234';
  //   const spy = jest
  //     .spyOn(authService, 'refreshAccessToken')
  //     .mockReturnValueOnce(of({ token: TOKEN, expiresIn: 123 }));

  //   // Make an HTTP GET request, don't care about the response
  //   httpClient.get('/test').subscribe((data) => {
  //     console.log(data);
  //   });

  //   const req = httpTestingController.expectOne('/test');

  //   // Set the response to be a 401
  //   req.flush({}, { status: 401, statusText: 'Unauthorized' });

  //   // two request happen
  //   const req2 = httpTestingController.expectOne('/test');

  //   expect(req2.request.headers.get('Authorization')).toBeTruthy();
  //   expect(req2.request.headers.get('Authorization')).toEqual(
  //     `Bearer ${TOKEN}`
  //   );

  //   httpTestingController.verify();
  //   spy.mockClear();
  // });

  // it('should call facade.logout() if the refresh token fails', () => {
  //   const spy = jest
  //     .spyOn(authService, 'refreshAccessToken')
  //     .mockReturnValueOnce(throwError('Could not refresh access token'));

  //   const spy2 = jest.spyOn(authFacade, 'logout');

  //   // Make an HTTP GET request, don't care about the response
  //   httpClient.get('/test').subscribe((data) => {
  //     console.log(data);
  //   });

  //   const req = httpTestingController.expectOne('/test');

  //   // Set the response to be a 401
  //   req.flush({}, { status: 401, statusText: 'Unauthorized' });

  //   expect(spy2).toHaveBeenCalled();

  //   httpTestingController.verify();

  //   spy.mockClear();
  //   spy2.mockClear();
  // });

  // it('should not try and refresh the access token if 401 status is received on login attempt', () => {
  //   const spy = jest.spyOn(authService, 'refreshAccessToken');

  //   const body = { operationName: 'LoginUser' };
  //   // Make an HTTP GET request, don't care about the response
  //   httpClient.post('/graphql', body).subscribe((data) => {
  //     console.log(data);
  //   });

  //   const req = httpTestingController.expectOne('/graphql');

  //   // Set the response to be a 401
  //   req.flush({}, { status: 401, statusText: 'Unauthorized' });

  //   expect(spy).not.toHaveBeenCalled();

  //   httpTestingController.verify();

  //   spy.mockClear();
  // });
});
