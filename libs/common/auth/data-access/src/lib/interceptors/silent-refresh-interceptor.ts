import { Injectable, Inject } from '@angular/core';
import {
  HttpInterceptor,
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpErrorResponse,
} from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, switchMap, map, exhaustMap, tap } from 'rxjs/operators';
import { AuthFacade } from '../+state/auth.facade';
import { AuthService } from '../services/auth.service';
import { AUTH_SERVER_URL } from '../tokens/tokens';

@Injectable({ providedIn: 'root' })
export class SilentRefreshInterceptor implements HttpInterceptor {
  constructor(
    @Inject(AUTH_SERVER_URL) private serverUrl: string,
    private facade: AuthFacade,
    private service: AuthService
  ) {}

  intercept(
    req: HttpRequest<any>,
    next: HttpHandler
  ): Observable<HttpEvent<any>> {
    return next.handle(req).pipe(
      catchError((response: HttpErrorResponse) => {
        if (response instanceof HttpErrorResponse && response.status === 401) {
          if (this.shouldNotRetryRequest(req)) {
            return throwError(response);
          } else {
            return this.service.refreshAccessToken().pipe(
              tap((res) => this.facade.setAuthenticated(res)),
              map(({ token }) =>
                req.clone({ setHeaders: { Authorization: `Bearer ${token}` } })
              ),
              switchMap((request) => next.handle(request)),
              catchError((e) => {
                this.facade.logout();
                return throwError(response);
              })
            );
          }
        } else {
          return throwError(response);
        }
      })
    );
  }

  shouldNotRetryRequest(req: HttpRequest<any>): boolean {
    const path = req.url.substr(this.serverUrl.length);
    return (
      (path === '/graphql' && req.body?.operationName === 'Authorize') ||
      path === '/authorize/refresh' ||
      path === '/authorize/revoke'
    ); // must match up with the name of the login graphql mutation
  }
}
