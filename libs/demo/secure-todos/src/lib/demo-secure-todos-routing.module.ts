import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ExampleTodosComponent } from './example-todos/example-todos.component';

// For the 'demos', the components are lazy loaded on scroll.
// Hence when you click to 'show' the todos application
// there is not a 'double' lazy loading (as this module is already loaded)
// and it only lazy loads the todos feature shell
const ROUTES: Routes = [
  {
    path: '',
    component: ExampleTodosComponent,
    loadChildren: () =>
      import('@ztp/todos/feature-shell').then((m) => m.TodosFeatureShellModule),
  },
];

@NgModule({
  imports: [RouterModule.forChild(ROUTES)],
  exports: [RouterModule],
})
export class DemoSecureTodosRoutingModule {}
