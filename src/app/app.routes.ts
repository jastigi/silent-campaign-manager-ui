import {
  Routes
} from '@angular/router';

import {
  authGuard
} from './core/auth/auth.guard';

import {
  Login
} from './features/auth/pages/login/login';

import {
  CampaignList
} from './features/campaigns/pages/campaign-list/campaign-list';

import {
  Shell
} from './layout/shell/shell';

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
    ],
    children: [
      {
        path: '',
        redirectTo: 'campaigns',
        pathMatch: 'full'
      },
      {
        path: 'campaigns',
        component: CampaignList
      }
    ]
  },
  {
    path: '**',
    redirectTo: ''
  }
];