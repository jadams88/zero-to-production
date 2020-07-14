import { NgModule } from '@angular/core';
import { ExampleTodosComponent } from './example-todos/example-todos.component';
import { DemoSecureTodosRoutingModule } from './demo-secure-todos-routing.module';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { SelectApiComponent } from './select-api/select-api.component';
import { DemoApiStatusComponent } from './status/status.component';
import { MatSelectModule } from '@angular/material/select';

@NgModule({
  imports: [
    CommonModule,
    MatButtonModule,
    MatSelectModule,
    DemoSecureTodosRoutingModule,
  ],
  declarations: [
    ExampleTodosComponent,
    SelectApiComponent,
    DemoApiStatusComponent,
  ],
})
export class DemoSecureTodosModule {}
