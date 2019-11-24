import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ExamplesFeatureShellComponent } from './examples-feature-shell.component';
import { ExamplesComponent } from './examples/examples.component';
import { ExampleDetailComponent } from './example-detail/example-detail.component';

export const EXAMPLES_ROUTES: Routes = [
  {
    path: 'examples',
    component: ExamplesFeatureShellComponent,
    children: [
      {
        path: '',
        pathMatch: 'full',
        component: ExamplesComponent
      },
      {
        path: 'dynamic-form',
        component: ExampleDetailComponent,
        loadChildren: () =>
          import('@ngw/examples/dynamic-form').then(
            m => m.WebExamplesDynamicFormModule
          )
      },
      {
        path: 'form-builder',
        component: ExampleDetailComponent,
        loadChildren: () =>
          import('@ngw/examples/form-builder').then(
            m => m.WebExamplesFormBuilderModule
          )
      },
      {
        path: 'themeing',
        component: ExampleDetailComponent,
        loadChildren: () =>
          import('@ngw/examples/themeing').then(
            m => m.WebExamplesThemeingModule
          )
      },
      {
        path: 'secure',
        component: ExampleDetailComponent,
        loadChildren: () =>
          import('@ngw/todos/feature-shell').then(
            m => m.TodosFeatureShellModule
          )
      }
    ]
  },

  {
    path: '',
    pathMatch: 'full',
    redirectTo: 'examples'
  },
  {
    path: '**',
    redirectTo: 'examples'
  }
];

@NgModule({
  imports: [RouterModule.forChild(EXAMPLES_ROUTES)]
})
export class ExamplesFeatureShellRoutingModule {}
