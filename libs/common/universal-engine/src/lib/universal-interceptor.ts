import { Injectable, Inject, Optional } from '@angular/core';
import {
  HttpInterceptor,
  HttpHandler,
  HttpRequest,
} from '@angular/common/http';
import { Request } from 'koa';
import { REQUEST } from './tokens';

/**
 * In a Universal app, HTTP URLs must be absolute (for example, https://my-server.com/api/heroes).
 * This means you need to change your services to make requests with absolute URLs when running
 * on the server and with relative URLs when running in the browser.
 *
 * This is only needed if you use relative urls in the HttpClient, however we
 * use absolute paths anyway https://api.zero-to-production.dev so it is not needed
 */
@Injectable()
export class UniversalInterceptor implements HttpInterceptor {
  constructor(@Optional() @Inject(REQUEST) protected request: Request) {}

  intercept(req: HttpRequest<any>, next: HttpHandler) {
    let serverReq = req;
    if (this.request) {
      let newUrl = `${this.request.protocol}://${this.request.get('host')}`;
      if (!req.url.startsWith('/')) {
        newUrl += '/';
      }
      newUrl += req.url;
      serverReq = req.clone({ url: newUrl });
    }
    return next.handle(serverReq);
  }
}
