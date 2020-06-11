import { NgModule } from '@angular/core';
import { ServerModule } from '@angular/platform-server';

import { AppModule } from './app.module';
import { AppComponent } from './app.component';
import { UniversalInterceptor } from '@ztp/common/data-access';
import { HTTP_INTERCEPTORS } from '@angular/common/http';

@NgModule({
  imports: [AppModule, ServerModule],
  bootstrap: [AppComponent],
  providers: [
    {
      provide: HTTP_INTERCEPTORS,
      multi: true,
      useClass: UniversalInterceptor,
    },
  ],
})
export class AppServerModule {}
