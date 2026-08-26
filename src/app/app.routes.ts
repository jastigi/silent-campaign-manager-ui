import { Routes } from '@angular/router';

import { authGuard } from './core/auth/auth.guard';

import { Login } from './features/auth/pages/login/login';

import { CampaignList } from './features/campaigns/pages/campaign-list/campaign-list';

import { Shell } from './layout/shell/shell';

import { CampaignDetail } from './features/campaigns/pages/campaign-detail/campaign-detail';

import { CampaignForm } from './features/campaigns/pages/campaign-form/campaign-form';

import { SubmarineList } from './features/submarines/pages/submarine-list/submarine-list';

import { SubmarineDetail } from './features/submarines/pages/submarine-detail/submarine-detail';

import { SubmarineForm } from './features/submarines/pages/submarine-form/submarine-form';

import { PatrolDetail } from './features/patrols/pages/patrol-detail/patrol-detail';

import { PatrolForm } from './features/patrols/pages/patrol-form/patrol-form';

export const routes: Routes = [
  {
    path: 'login',
    component: Login,
  },
  {
    path: '',
    component: Shell,
    canActivate: [authGuard],
    children: [
      {
        path: '',
        redirectTo: 'campaigns',
        pathMatch: 'full',
      },
      {
        path: 'campaigns/new',
        component: CampaignForm,
      },
      {
        path: 'campaigns/:id/edit',
        component: CampaignForm,
      },
      {
        path: 'campaigns/:id',
        component: CampaignDetail,
      },
      {
        path: 'campaigns/:campaignId/patrols/new',
        component: PatrolForm,
      },
      {
        path: 'campaigns/:campaignId/patrols/:patrolId',
        component: PatrolDetail,
      },
      {
        path: 'campaigns',
        component: CampaignList,
      },
      {
        path: 'submarines',
        component: SubmarineList,
      },
      {
        path: 'submarines/new',
        component: SubmarineForm,
      },
      {
        path: 'submarines/:id/edit',
        component: SubmarineForm,
      },
      {
        path: 'submarines/:id',
        component: SubmarineDetail,
      },
    ],
  },
  {
    path: '**',
    redirectTo: '',
  },
];
