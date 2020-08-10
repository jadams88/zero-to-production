import { Injectable } from '@angular/core';
import {
  HttpInterceptor,
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpErrorResponse,
} from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, tap, switchMap, map } from 'rxjs/operators';
import { AuthFacade } from '../+state/auth.facade';
import { AuthService } from '../services/auth.service';

@Injectable({ providedIn: 'root' })
export class SilentRefreshInterceptor implements HttpInterceptor {
  constructor(private facade: AuthFacade, private service: AuthService) {}

  intercept(
    req: HttpRequest<any>,
    next: HttpHandler
  ): Observable<HttpEvent<any>> {
    return next.handle(req).pipe(
      catchError((response: HttpErrorResponse) => {
        if (response instanceof HttpErrorResponse && response.status === 401) {
          if (isReqLoginAttempt(req)) {
            return throwError(response);
          } else {
            return this.service.refreshAccessToken().pipe(
              tap((res) => this.service.setSession(res)),
              map(({ token }) =>
                req.clone({ setHeaders: { Authorization: `Bearer ${token}` } })
              ),
              switchMap((req) => next.handle(req)),
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
}

function isReqLoginAttempt(req: HttpRequest<any>): boolean {
  const parts = req.url.split('/');
  return (
    parts[parts.length - 1] === 'graphql' &&
    req.body?.operationName === 'LoginUser'
  ); // must match up with the name of the login graphql mutation
}
