import { Component, inject, signal } from '@angular/core';

import { DatePipe, DecimalPipe } from '@angular/common';

import { ActivatedRoute, Router } from '@angular/router';

import { MatButtonModule } from '@angular/material/button';

import { MatCardModule } from '@angular/material/card';

import { MatChipsModule } from '@angular/material/chips';

import { MatIconModule } from '@angular/material/icon';

import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import { MatTableModule } from '@angular/material/table';

import { CampaignService } from '../../data-access/campaign.service';

import { CampaignDetails } from '../../models/campaign.model';

import { CampaignStatistics } from '../../models/campaign-statistics.model';

import {
  CampaignTimelineEvent,
  CampaignTimelineEventType,
} from '../../models/campaign-timeline.model';

import { PageEvent } from '@angular/material/paginator';

import { MatPaginatorModule } from '@angular/material/paginator';

import { CampaignExecution, CampaignExecutionStatus } from '../../models/campaign-execution.model';

import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

import { CampaignSimulationResult } from '../../models/campaign-simulation.model';

@Component({
  selector: 'app-campaign-detail',
  imports: [
    DatePipe,
    DecimalPipe,
    MatSnackBarModule,
    MatPaginatorModule,
    MatButtonModule,
    MatCardModule,
    MatChipsModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatTableModule,
  ],
  templateUrl: './campaign-detail.html',
  styleUrl: './campaign-detail.scss',
})
export class CampaignDetail {
  private readonly route = inject(ActivatedRoute);

  private readonly router = inject(Router);

  private readonly campaignService = inject(CampaignService);

  private readonly snackBar = inject(MatSnackBar);

  readonly campaign = signal<CampaignDetails | null>(null);

  readonly loading = signal(true);

  readonly loadError = signal(false);

  readonly displayedPatrolColumns = ['id', 'patrolName', 'area', 'result'];

  readonly statistics = signal<CampaignStatistics | null>(null);

  readonly statisticsLoading = signal(true);

  readonly statisticsError = signal(false);

  readonly timeline = signal<CampaignTimelineEvent[]>([]);

  readonly timelineLoading = signal(true);

  readonly timelineError = signal(false);

  readonly executions = signal<CampaignExecution[]>([]);

  readonly executionsLoading = signal(true);

  readonly executionsError = signal(false);

  readonly executionsTotal = signal(0);

  readonly executionsPageIndex = signal(0);

  readonly executionsPageSize = signal(10);

  readonly executionColumns = ['id', 'status', 'patrols', 'startedAt', 'completedAt'];

  readonly simulating = signal(false);

  readonly simulationResult = signal<CampaignSimulationResult | null>(null);

  constructor() {
    const id = Number(this.route.snapshot.paramMap.get('id'));

    this.loadCampaign(id);
    this.loadStatistics(id);
    this.loadTimeline(id);
    this.loadExecutions(id);
  }

  private loadCampaign(id: number): void {
    this.loading.set(true);
    this.loadError.set(false);

    this.campaignService.getCampaignDetails(id).subscribe({
      next: (campaign) => {
        this.campaign.set(campaign);

        this.loading.set(false);
      },

      error: () => {
        this.loading.set(false);
        this.loadError.set(true);
      },
    });
  }

  back(): void {
    this.router.navigate(['/campaigns']);
  }

  statusClass(status: CampaignDetails['status']): string {
    return `status-${status.toLowerCase()}`;
  }

  resultClass(result: string | null): string {
    if (!result) {
      return 'result-pending';
    }

    return `result-${result.toLowerCase().replace('_', '-')}`;
  }

  missionOutcomeClass(outcome: string | null | undefined): string {
    switch (outcome) {
      case 'SUCCESS':
        return 'mission-outcome-success';

      case 'PARTIAL_SUCCESS':
        return 'mission-outcome-partial';

      case 'FAILURE':
        return 'mission-outcome-failure';

      default:
        return 'mission-outcome-neutral';
    }
  }

  private loadStatistics(id: number): void {
    this.statisticsLoading.set(true);
    this.statisticsError.set(false);

    this.campaignService.getCampaignStatistics(id).subscribe({
      next: (statistics) => {
        this.statistics.set(statistics);

        this.statisticsLoading.set(false);
      },

      error: () => {
        this.statisticsLoading.set(false);
        this.statisticsError.set(true);
      },
    });
  }

  private loadTimeline(id: number): void {
    this.timelineLoading.set(true);
    this.timelineError.set(false);

    this.campaignService.getCampaignTimeline(id).subscribe({
      next: (timeline) => {
        this.timeline.set(timeline);

        this.timelineLoading.set(false);
      },

      error: () => {
        this.timelineLoading.set(false);
        this.timelineError.set(true);
      },
    });
  }

  timelineClass(type: CampaignTimelineEventType): string {
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

  private loadExecutions(campaignId: number): void {
    this.executionsLoading.set(true);
    this.executionsError.set(false);

    this.campaignService
      .getCampaignExecutions(campaignId, this.executionsPageIndex(), this.executionsPageSize())
      .subscribe({
        next: (response) => {
          this.executions.set(response.content);

          this.executionsTotal.set(response.totalElements);

          this.executionsLoading.set(false);
        },

        error: () => {
          this.executionsLoading.set(false);
          this.executionsError.set(true);
        },
      });
  }

  onExecutionPageChange(event: PageEvent): void {
    this.executionsPageIndex.set(event.pageIndex);

    this.executionsPageSize.set(event.pageSize);

    const campaignId = Number(this.route.snapshot.paramMap.get('id'));

    this.loadExecutions(campaignId);
  }

  executionStatusClass(status: CampaignExecutionStatus): string {
    return `execution-${status.toLowerCase()}`;
  }

  runSimulation(): void {
    const campaign = this.campaign();

    if (!campaign) {
      return;
    }

    if (campaign.status !== 'ACTIVE') {
      return;
    }

    const confirmed = window.confirm(`Run simulation for "${campaign.name}"?`);

    if (!confirmed) {
      return;
    }

    this.simulating.set(true);

    this.campaignService.simulateCampaign(campaign.id).subscribe({
      next: (result) => {
        this.simulationResult.set(result);

        this.simulating.set(false);

        this.snackBar.open('Campaign simulation completed successfully.', 'Close', {
          duration: 5000,
        });

        this.executionsPageIndex.set(0);

        this.loadCampaign(campaign.id);

        this.loadStatistics(campaign.id);

        this.loadTimeline(campaign.id);

        this.loadExecutions(campaign.id);
      },

      error: (error) => {
        this.simulating.set(false);

        const message = error?.error?.message ?? 'Campaign simulation failed.';

        this.snackBar.open(message, 'Close', {
          duration: 7000,
        });

        /*
         * Even failed simulations may generate
         * execution-history records.
         */
        this.executionsPageIndex.set(0);

        this.loadExecutions(campaign.id);

        this.loadTimeline(campaign.id);
      },
    });
  }
}
