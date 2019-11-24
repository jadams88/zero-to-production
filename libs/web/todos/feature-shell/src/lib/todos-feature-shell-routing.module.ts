import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { TodoFeatureShellComponent } from './todos-feature-shell.component';
import { TodoLayoutComponent } from './ui/todos-layout.component';
import { AuthGuard } from '@ngw/data-access/auth';
import { AuthUsersResolver } from '@ngw/data-access/users';
import { AUTH_ROUTES } from '@ngw/shared/auth-routes';

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
            component: TodoLayoutComponent,
            pathMatch: 'full'
          },
          {
            path: ':todoId',
            component: TodoLayoutComponent
          }
        ],

        data: { animation: 'TodosPage' }
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
    ],
    canActivate: [AuthGuard],
    resolve: {
      user: AuthUsersResolver
    },
    data: {
      animation: 'AppPages'
    }
  },
  ...AUTH_ROUTES,
  {
    path: '',
    pathMatch: 'full',
    redirectTo: 'home'
  },
  {
    path: '**',
    redirectTo: 'home'
  }
];

@NgModule({
  imports: [RouterModule.forChild(TODOS_ROUTES)]
})
export class TodosFeatureShellRoutingModule {}
