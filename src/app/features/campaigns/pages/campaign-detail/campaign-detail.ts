import {
  Component,
  inject,
  signal
} from '@angular/core';

import {
  DatePipe
} from '@angular/common';

import {
  ActivatedRoute,
  Router
} from '@angular/router';

import {
  MatButtonModule
} from '@angular/material/button';

import {
  MatCardModule
} from '@angular/material/card';

import {
  MatChipsModule
} from '@angular/material/chips';

import {
  MatIconModule
} from '@angular/material/icon';

import {
  MatProgressSpinnerModule
} from '@angular/material/progress-spinner';

import {
  MatTableModule
} from '@angular/material/table';

import {
  CampaignService
} from '../../data-access/campaign.service';

import {
  CampaignDetails
} from '../../models/campaign.model';

@Component({
  selector: 'app-campaign-detail',
  imports: [
    DatePipe,
    MatButtonModule,
    MatCardModule,
    MatChipsModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatTableModule
  ],
  templateUrl: './campaign-detail.html',
  styleUrl: './campaign-detail.scss'
})
export class CampaignDetail {

  private readonly route =
    inject(ActivatedRoute);

  private readonly router =
    inject(Router);

  private readonly campaignService =
    inject(CampaignService);

  readonly campaign =
    signal<CampaignDetails | null>(null);

  readonly loading =
    signal(true);

  readonly loadError =
    signal(false);

  readonly displayedPatrolColumns = [
    'id',
    'patrolName',
    'area',
    'result'
  ];

  constructor() {

    const id =
      Number(
        this.route.snapshot.paramMap.get('id')
      );

    this.loadCampaign(id);
  }

  private loadCampaign(
    id: number
  ): void {

    this.loading.set(true);
    this.loadError.set(false);

    this.campaignService
      .getCampaignDetails(id)
      .subscribe({
        next: campaign => {

          this.campaign.set(
            campaign
          );

          this.loading.set(false);
        },

        error: () => {

          this.loading.set(false);
          this.loadError.set(true);
        }
      });
  }

  back(): void {

    this.router.navigate([
      '/campaigns'
    ]);
  }

}