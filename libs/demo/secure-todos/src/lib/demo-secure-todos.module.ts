import { NgModule } from '@angular/core';
import { ExampleTodosComponent } from './example-todos/example-todos.component';
import { DemoSecureTodosRoutingModule } from './demo-secure-todos-routing.module';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';

@NgModule({
  imports: [CommonModule, MatButtonModule, DemoSecureTodosRoutingModule],
  declarations: [ExampleTodosComponent],
})
export class DemoSecureTodosModule {}
