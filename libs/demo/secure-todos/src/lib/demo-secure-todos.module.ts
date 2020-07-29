import { NgModule } from '@angular/core';
import { ExampleTodosComponent } from './example-todos/example-todos.component';
import { DemoSecureTodosRoutingModule } from './demo-secure-todos-routing.module';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { SelectApiComponent } from './select-api/select-api.component';
import { DemoApiStatusComponent } from './status/status.component';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { TodosFeatureShellModule } from '@ztp/todos/feature-shell';

@NgModule({
  imports: [
    CommonModule,
    MatButtonModule,
    MatSelectModule,
    MatFormFieldModule,
    DemoSecureTodosRoutingModule,
    TodosFeatureShellModule,
  ],
  declarations: [
    ExampleTodosComponent,
    SelectApiComponent,
    DemoApiStatusComponent,
  ],
})
export class DemoSecureTodosModule {}
