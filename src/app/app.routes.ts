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

import {
  CampaignDetail
} from './features/campaigns/pages/campaign-detail/campaign-detail';

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
        path: 'campaigns/:id',
        component: CampaignDetail
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