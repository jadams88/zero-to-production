import { Injectable } from '@angular/core';
import {
  HttpInterceptor,
  HttpHandler,
  HttpRequest,
  HttpEvent,
} from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthFacade } from '../+state/auth.facade';
import { switchMap, take } from 'rxjs/operators';

@Injectable({ providedIn: 'root' })
export class AuthInterceptor implements HttpInterceptor {
  constructor(private auth: AuthFacade) {}

  intercept(
    req: HttpRequest<any>,
    next: HttpHandler
  ): Observable<HttpEvent<any>> {
    // Get the auth token from the service.
    return this.auth.accessToken$.pipe(
      // must unsubscribe from the token,
      take(1),
      switchMap((token) =>
        token
          ? next.handle(
              req.clone({ setHeaders: { Authorization: `Bearer ${token}` } })
            )
          : next.handle(req)
      )
    );
  }
}
