import { Routes } from '@angular/router';

import { Login } from './features/auth/pages/login/login';
import { Shell } from './layout/shell/shell';

import {
  authGuard
} from './core/auth/auth.guard';

export const routes: Routes = [
  {
    path: 'login',
    component: Login
  },
  {
    path: '',
    component: Shell,
    canActivate: [
      authGuard
    ]
  },
  {
    path: '**',
    redirectTo: ''
  }
];