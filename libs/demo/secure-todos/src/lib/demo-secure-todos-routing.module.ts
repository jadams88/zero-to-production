import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ExampleTodosComponent } from './example-todos/example-todos.component';
import { TODOS_ROUTES } from '@ztp/todos/feature-shell';

const ROUTES: Routes = [
  {
    path: '',
    component: ExampleTodosComponent,
    children: TODOS_ROUTES,
  },
];

@NgModule({
  imports: [RouterModule.forChild(ROUTES)],
  exports: [RouterModule],
})
export class DemoSecureTodosRoutingModule {}
