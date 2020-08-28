import { NgModule } from '@angular/core';
import {
  ServerModule,
  ServerTransferStateModule,
} from '@angular/platform-server';

import { AppModule } from './app.module';
import { AppComponent } from './app.component';
import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { UniversalInterceptor } from '@ztp/common/universal-engine';
import {
  LOGIN_PAGE,
  REGISTER_PAGE,
  LOGIN_REDIRECT,
} from '@ztp/common/auth/data-access';

@NgModule({
  imports: [AppModule, ServerModule, ServerTransferStateModule],
  bootstrap: [AppComponent],
  providers: [
    { provide: LOGIN_PAGE, useValue: '/examples/todos/login' },
    { provide: REGISTER_PAGE, useValue: '/examples/todos/register' },
    { provide: LOGIN_REDIRECT, useValue: '/examples/todos/home' },
    {
      provide: HTTP_INTERCEPTORS,
      multi: true,
      useClass: UniversalInterceptor,
    },
  ],
})
export class AppServerModule {}
