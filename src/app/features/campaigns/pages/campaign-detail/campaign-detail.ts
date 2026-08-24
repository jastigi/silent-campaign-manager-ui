import {
  Component,
  inject,
  signal
} from '@angular/core';

import {
  DatePipe,
  DecimalPipe
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

import {
  CampaignStatistics
} from '../../models/campaign-statistics.model';

import {
  CampaignTimelineEvent,
  CampaignTimelineEventType
} from '../../models/campaign-timeline.model';

@Component({
  selector: 'app-campaign-detail',
  imports: [
    DatePipe,
    DecimalPipe,
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

  readonly statistics =
  signal<CampaignStatistics | null>(null);

  readonly statisticsLoading =
    signal(true);

  readonly statisticsError =
    signal(false);

  readonly timeline =
  signal<CampaignTimelineEvent[]>([]);

  readonly timelineLoading =
    signal(true);

  readonly timelineError =
    signal(false);

  constructor() {

    const id =
      Number(
        this.route.snapshot.paramMap.get('id')
      );

    this.loadCampaign(id);
    this.loadStatistics(id);
    this.loadTimeline(id);
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

  statusClass(
    status: CampaignDetails['status']
  ): string {

    return `status-${status.toLowerCase()}`;
  }

  resultClass(
    result: string | null
  ): string {

    if (!result) {
      return 'result-pending';
    }

    return `result-${result.toLowerCase().replace('_', '-')}`;
  }

  private loadStatistics(
    id: number
  ): void {

    this.statisticsLoading.set(true);
    this.statisticsError.set(false);

    this.campaignService
      .getCampaignStatistics(id)
      .subscribe({
        next: statistics => {

          this.statistics.set(
            statistics
          );

          this.statisticsLoading.set(false);
        },

        error: () => {

          this.statisticsLoading.set(false);
          this.statisticsError.set(true);
        }
      });
  }

  private loadTimeline(
    id: number
  ): void {

    this.timelineLoading.set(true);
    this.timelineError.set(false);

    this.campaignService
      .getCampaignTimeline(id)
      .subscribe({
        next: timeline => {

          this.timeline.set(
            timeline
          );

          this.timelineLoading.set(false);
        },

        error: () => {

          this.timelineLoading.set(false);
          this.timelineError.set(true);
        }
      });
  }

  timelineClass(
    type: CampaignTimelineEventType
  ): string {

    switch (type) {

      case 'CAMPAIGN_EXECUTION_STARTED':
        return 'timeline-blue';

      case 'CAMPAIGN_EXECUTION_COMPLETED':
        return 'timeline-green';

      case 'CAMPAIGN_EXECUTION_FAILED':
        return 'timeline-red';

      case 'PATROL_COMPLETED':
        return 'timeline-amber';

    }
  }

}