import { Routes } from '@angular/router';
import { LoginComponent } from './components/login/login.component';
import { RegisterComponent } from './components/register/register.component';
import { AuthComponent } from './components/auth.component';
import { LoggedInGuard } from '@ngw/data-access/auth';

export const AUTH_ROUTES: Routes = [
  {
    path: '',
    component: AuthComponent,
    children: [
      {
        path: 'login',
        pathMatch: 'full',
        component: LoginComponent,
        canActivate: [LoggedInGuard],
        data: { animation: 'LoginPage' }
      },
      {
        path: 'register',
        pathMatch: 'full',
        component: RegisterComponent,
        data: { animation: 'RegisterPage' }
      }
    ],
    data: {
      animation: 'AuthPages'
    }
  }
];
