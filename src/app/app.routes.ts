import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./features/landing/pages/home/home.component').then(
        (m) => m.HomeComponent,
      ),
  },
  {
    path: 'login',
    loadComponent: () =>
      import('./features/authentication/pages/login/login.component').then(
        (m) => m.LoginComponent,
      ),
  },
  {
    path: 'registro',
    loadComponent: () =>
      import('./features/authentication/pages/register/register.component').then(
        (m) => m.RegisterComponent,
      ),
  },
  {
    path: 'perfil',
    loadComponent: () =>
      import('./features/profile/profile.component').then(
        (m) => m.ProfileComponent,
      ),
    canActivate: [authGuard],
  },
  {
    path: '**',
    redirectTo: '',
  },
];