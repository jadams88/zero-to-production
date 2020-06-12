import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ExampleComponent } from './example/example.component';

const ROUTES: Routes = [
  {
    path: '',
    component: ExampleComponent,
    children: [
      {
        path: 'dynamic-form',
        loadChildren: () =>
          import('@ztp/demo/dynamic-form').then((m) => m.DemoDynamicFormModule),
        data: { preload: true },
      },
      {
        path: 'form-builder',
        loadChildren: () =>
          import('@ztp/demo/form-builder').then((m) => m.DemoFormBuilderModule),
      },
      {
        path: 'theming',
        loadChildren: () =>
          import('@ztp/demo/theming').then((m) => m.DemoThemingModule),
      },
      {
        path: 'lazy-scrolling',
        loadChildren: () =>
          import('@ztp/demo/lazy-load-scrolling').then(
            (m) => m.DemoLazyLoadScrollingModule
          ),
      },
      {
        path: 'todos',
        loadChildren: () =>
          import('@ztp/demo/secure-todos').then((m) => m.DemoSecureTodosModule),
      },
      {
        path: 'make-it-your-own',
        loadChildren: () =>
          import('@ztp/demo/make-it-your-own').then(
            (m) => m.DemoStartYourOwnModule
          ),
      },
      {
        path: '**',
        redirectTo: 'dynamic-form',
      },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(ROUTES)],
  exports: [RouterModule],
})
export class DemoExamplesRouterModule {}
