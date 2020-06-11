import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DemoFeatureShellComponent } from './demo-feature-shell.component';
import { DemoHomeComponent } from './home/home.component';

export const Demo_ROUTES: Routes = [
  {
    path: '',
    component: DemoFeatureShellComponent,
    children: [
      {
        path: 'home',
        pathMatch: 'full',
        component: DemoHomeComponent,
      },
      {
        path: 'examples',
        loadChildren: () =>
          import('@ztp/demo/live-demos').then((m) => m.DemoLiveDemosModule),
        data: { preload: true }, // Preload this route
      },
      {
        path: 'guides',
        loadChildren: () =>
          import('@ztp/demo/guides').then((m) => m.DemoGuidesModule),
        data: { preload: true }, // Preload this route
      },
      {
        path: '**',
        redirectTo: 'home', // TODO -> 404 page
      },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(Demo_ROUTES)],
  exports: [RouterModule],
})
export class DemoFeatureShellRoutingModule {}
