import { Component, inject, signal } from '@angular/core';

import { DatePipe } from '@angular/common';

import { MatButtonModule } from '@angular/material/button';

import { MatChipsModule } from '@angular/material/chips';

import { MatFormFieldModule } from '@angular/material/form-field';

import { MatIconModule } from '@angular/material/icon';

import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';

import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import { MatSelectModule } from '@angular/material/select';

import { MatTableModule } from '@angular/material/table';

import { CampaignService } from '../../data-access/campaign.service';

import {
  Campaign,
  CampaignStatus,
} from '../../models/campaign.model';

import { Router } from '@angular/router';

@Component({
  selector: 'app-campaign-list',
  imports: [
    DatePipe,
    MatButtonModule,
    MatChipsModule,
    MatFormFieldModule,
    MatIconModule,
    MatPaginatorModule,
    MatProgressSpinnerModule,
    MatSelectModule,
    MatTableModule,
  ],
  templateUrl: './campaign-list.html',
  styleUrl: './campaign-list.scss',
})
export class CampaignList {
  private readonly campaignService = inject(CampaignService);

  private readonly router = inject(Router);

  readonly campaigns = signal<Campaign[]>([]);

  readonly loading = signal(true);

  readonly loadError = signal(false);

  readonly totalElements = signal(0);

  readonly pageIndex = signal(0);

  readonly pageSize = signal(10);

  readonly selectedStatus =
    signal<CampaignStatus | 'ALL'>('ALL');

  readonly filteredCampaigns =
    signal<Campaign[]>([]);

  readonly statusOptions: {
    value: CampaignStatus | 'ALL';
    label: string;
  }[] = [
    {
      value: 'ALL',
      label: 'All campaigns',
    },
    {
      value: 'ACTIVE',
      label: 'Active',
    },
    {
      value: 'FINISHED',
      label: 'Finished',
    },
    {
      value: 'ABANDONED',
      label: 'Abandoned',
    },
  ];

  readonly displayedColumns = ['id', 'name', 'startDate', 'status'];

  constructor() {
    this.loadCampaigns();
  }

  loadCampaigns(): void {
    this.loading.set(true);
    this.loadError.set(false);

    if (this.selectedStatus() === 'ALL') {
      this.loadAllCampaigns();

      return;
    }

    this.loadCampaignsByStatus(
      this.selectedStatus() as CampaignStatus,
    );
  }

  private loadAllCampaigns(): void {
    this.campaignService
      .getCampaigns(
        this.pageIndex(),
        this.pageSize(),
        'id',
        'asc',
      )
      .subscribe({
        next: (response) => {
          this.campaigns.set(
            response.content,
          );

          this.filteredCampaigns.set([]);

          this.totalElements.set(
            response.totalElements,
          );

          this.loading.set(false);
        },

        error: () => {
          this.loading.set(false);
          this.loadError.set(true);
        },
      });
  }

  private loadCampaignsByStatus(
    status: CampaignStatus,
  ): void {
    this.campaignService
      .getCampaignsByStatus(status)
      .subscribe({
        next: (campaigns) => {
          this.filteredCampaigns.set(
            campaigns,
          );

          this.totalElements.set(
            campaigns.length,
          );

          this.applyFilteredPage();

          this.loading.set(false);
        },

        error: () => {
          this.loading.set(false);
          this.loadError.set(true);
        },
      });
  }

  private applyFilteredPage(): void {
    const start =
      this.pageIndex() *
      this.pageSize();

    const end =
      start +
      this.pageSize();

    this.campaigns.set(
      this.filteredCampaigns()
        .slice(start, end),
    );
  }

  onStatusChange(
    status: CampaignStatus | 'ALL',
  ): void {
    this.selectedStatus.set(status);

    this.pageIndex.set(0);

    this.loadCampaigns();
  }

  refresh(): void {
    this.loadCampaigns();
  }

  onPageChange(event: PageEvent): void {
    this.pageIndex.set(
      event.pageIndex,
    );

    this.pageSize.set(
      event.pageSize,
    );

    if (
      this.selectedStatus() ===
      'ALL'
    ) {
      this.loadCampaigns();

      return;
    }

    this.applyFilteredPage();
  }

  createCampaign(): void {
    this.router.navigate(['/campaigns/new']);
  }

  openCampaign(campaign: Campaign): void {
    this.router.navigate(['/campaigns', campaign.id]);
  }

  statusClass(status: Campaign['status']): string {
    return `status-${status.toLowerCase()}`;
  }
}
