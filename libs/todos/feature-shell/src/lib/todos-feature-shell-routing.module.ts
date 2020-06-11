import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard, LoggedInGuard } from '@ztp/common/auth/data-access';
import {
  LoginComponent,
  RegisterComponent,
  AuthComponent,
} from '@ztp/common/auth/components';
import { AllTodosComponent } from '@ztp/todos/all-todos';
import { TodoDetailComponent } from '@ztp/todos/todo-detail';
import { TodoFeatureShellComponent } from './todos-feature-shell.component';
import { TodoResolver } from '@ztp/todos/data-access';

export const TODOS_ROUTES: Routes = [
  // the can activate guard will mean that this route will never
  // match if the user is not logged in
  {
    path: '',
    component: TodoFeatureShellComponent,
    children: [
      {
        path: 'home',
        loadChildren: () =>
          import('@ztp/shared/dashboard').then((m) => m.SharedDashboardModule),
      },
      {
        path: 'todos',
        children: [
          {
            path: '',
            component: AllTodosComponent,
            pathMatch: 'full',
            data: {
              animation: 'AllTodos',
            },
          },
          {
            path: ':todoId',
            component: TodoDetailComponent,
            pathMatch: 'full',
            resolve: {
              todo: TodoResolver,
            },
            data: {
              animation: 'TodoDetail',
            },
          },
        ],
      },
      {
        path: '',
        pathMatch: 'full',
        redirectTo: 'home',
      },
    ],
    canActivate: [AuthGuard],
    data: {
      animation: 'AppPages',
    },
  },
  {
    path: '',
    component: AuthComponent,
    children: [
      {
        path: 'login',
        pathMatch: 'full',
        component: LoginComponent,
        canActivate: [LoggedInGuard],
        data: { animation: 'LoginPage' },
      },
      {
        path: 'register',
        pathMatch: 'full',
        component: RegisterComponent,
        data: { animation: 'RegisterPage' },
      },
    ],
    data: {
      animation: 'AuthPages',
    },
  },
  {
    path: '',
    pathMatch: 'full',
    redirectTo: 'home',
  },
  {
    path: '**',
    redirectTo: 'home',
  },
];

@NgModule({
  imports: [RouterModule.forChild(TODOS_ROUTES)],
})
export class TodosFeatureShellRoutingModule {}
