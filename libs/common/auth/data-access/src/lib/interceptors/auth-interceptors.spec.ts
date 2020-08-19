import { TestBed } from '@angular/core/testing';
import { HTTP_INTERCEPTORS, HttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  HttpClientTestingModule,
} from '@angular/common/http/testing';
import { AuthInterceptor } from './auth-interceptor';
import { AuthFacade } from '../+state/auth.facade';
import { of } from 'rxjs';

describe('AuthInterceptor', () => {
  let httpClient: HttpClient;
  let httpTestingController: HttpTestingController;
  let auth: AuthFacade;

  const authSpy = {
    accessToken$: of(jest.fn()),
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        {
          provide: HTTP_INTERCEPTORS,
          useClass: AuthInterceptor,
          multi: true,
        },
        { provide: AuthFacade, useValue: authSpy },
      ],
    });

    httpClient = TestBed.inject<HttpClient>(HttpClient);
    httpTestingController = TestBed.inject(HttpTestingController);
    auth = TestBed.inject(AuthFacade);
  });

  it('should add a Bearer token to the Authorization header of all outgoing request', () => {
    const token = 'TOKEN';

    auth.accessToken$ = of(token);

    const someData = { data: 'someData ' };

    // Make an HTTP GET request
    httpClient.get('/test').subscribe((data) => {
      // When observable resolves, result should match test data
      expect(data).toEqual(someData);
    });

    // The following `expectOne()` will match the request's URL.
    // If no requests or multiple requests matched that URL
    // `expectOne()` would throw.
    const req = httpTestingController.expectOne('/test');

    // Assert that the request is a GET.
    expect(req.request.method).toEqual('GET');

    expect(req.request.headers.get('Authorization')).toBeTruthy();
    expect(req.request.headers.get('Authorization')).toEqual(`Bearer ${token}`);
    // Respond with mock data, causing Observable to resolve.
    // Subscribe callback asserts that correct data was returned.
    req.flush(someData);

    // Finally, assert that there are no outstanding requests.
    httpTestingController.verify();
  });

  it('should not have an Authorization header if their is no auth token', () => {
    auth.accessToken$ = of(null);

    const someData = { data: 'someData ' };

    // Make an HTTP GET request
    httpClient.get('/test').subscribe((data) => {
      // When observable resolves, result should match test data
      expect(data).toEqual(someData);
    });

    // The following `expectOne()` will match the request's URL.
    // If no requests or multiple requests matched that URL
    // `expectOne()` would throw.
    const req = httpTestingController.expectOne('/test');

    // Assert that the request is a GET.
    expect(req.request.method).toEqual('GET');

    expect(req.request.headers.get('Authorization')).not.toBeTruthy();
    // Respond with mock data, causing Observable to resolve.
    // Subscribe callback asserts that correct data was returned.
    req.flush(someData);

    // Finally, assert that there are no outstanding requests.
    httpTestingController.verify();
  });
});
