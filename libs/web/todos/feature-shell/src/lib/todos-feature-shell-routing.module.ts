import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { TodoFeatureShellComponent } from './todos-feature-shell.component';
import { TodoLayoutComponent } from './ui/todos-layout.component';

export const TODOS_ROUTES: Routes = [
  {
    path: '',
    component: TodoFeatureShellComponent,
    children: [
      {
        path: 'home',
        loadChildren: () =>
          import('@ngw/dashboard').then(m => m.DashboardModule),
        data: { animation: 'DashBoardPage' }
      },
      {
        path: 'todos',
        children: [
          {
            path: '',
            component: TodoLayoutComponent
          },
          {
            path: ':todoId',
            component: TodoLayoutComponent
          }
        ],

        data: { animation: 'TodosPage' }
      },
      {
        path: 'examples',
        loadChildren: () =>
          import('@ngw/examples').then(m => m.ExamplesFeatureShellModule),
        data: { animation: 'ExamplesPage' }
      },
      {
        path: 'profile',
        loadChildren: () =>
          import('@ngw/shared/profile').then(m => m.FrontendProfileModule),
        data: { animation: 'ProfilePage' }
      },
      {
        path: '',
        pathMatch: 'full',
        redirectTo: 'home'
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(TODOS_ROUTES)]
})
export class TodosFeatureShellRoutingModule {}