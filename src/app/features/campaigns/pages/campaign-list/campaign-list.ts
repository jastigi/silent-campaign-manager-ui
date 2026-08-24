import {
  Component,
  inject,
  signal
} from '@angular/core';

import {
  DatePipe
} from '@angular/common';

import {
  MatChipsModule
} from '@angular/material/chips';

import {
  MatPaginatorModule,
  PageEvent
} from '@angular/material/paginator';

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
  Campaign
} from '../../models/campaign.model';

import {
  Router
} from '@angular/router';

@Component({
  selector: 'app-campaign-list',
  imports: [
    DatePipe,
    MatChipsModule,
    MatPaginatorModule,
    MatProgressSpinnerModule,
    MatTableModule
  ],
  templateUrl: './campaign-list.html',
  styleUrl: './campaign-list.scss'
})
export class CampaignList {

  private readonly campaignService =
    inject(CampaignService);

  private readonly router =
    inject(Router);

  readonly campaigns =
    signal<Campaign[]>([]);

  readonly loading =
    signal(true);

  readonly loadError =
    signal(false);

  readonly totalElements =
    signal(0);

  readonly pageIndex =
    signal(0);

  readonly pageSize =
    signal(10);

  readonly displayedColumns = [
    'id',
    'name',
    'startDate',
    'status'
  ];

  constructor() {

    this.loadCampaigns();
  }

  loadCampaigns(): void {

    this.loading.set(true);
    this.loadError.set(false);

    this.campaignService
      .getCampaigns(
        this.pageIndex(),
        this.pageSize(),
        'id',
        'asc'
      )
      .subscribe({
        next: response => {

          this.campaigns.set(
            response.content
          );

          this.totalElements.set(
            response.totalElements
          );

          this.loading.set(false);
        },

        error: () => {

          this.loading.set(false);
          this.loadError.set(true);
        }
      });
  }

  onPageChange(
    event: PageEvent
  ): void {

    this.pageIndex.set(
      event.pageIndex
    );

    this.pageSize.set(
      event.pageSize
    );

    this.loadCampaigns();
  }

  openCampaign(
    campaign: Campaign
  ): void {

    this.router.navigate([
      '/campaigns',
      campaign.id
    ]);
  }

}