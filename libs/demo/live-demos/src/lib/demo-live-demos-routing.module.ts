import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DemoExamplesComponent } from './example-demos/examples-demos.component';

// For the 'demos', the components are lazy loaded on scroll.
// Hence when you click to 'show' the todos application
// there is not a 'double' lazy loading (as this module is already loaded)
// and it only lazy loads the todos feature shell
const ROUTES: Routes = [
  {
    path: '',
    component: DemoExamplesComponent,
    children: [
      {
        path: 'secure',
        loadChildren: () =>
          import('@ztp/demo/secure-todos').then((m) => m.DemoSecureTodosModule),
      },
    ],
  },
  {
    path: '',
    pathMatch: 'full',
    redirectTo: 'examples',
  },
];

@NgModule({
  imports: [RouterModule.forChild(ROUTES)],
  exports: [RouterModule],
})
export class DemoLiveDemosRoutingModule {}
