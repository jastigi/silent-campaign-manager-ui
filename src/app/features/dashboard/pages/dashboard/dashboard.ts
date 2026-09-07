import { Component, OnInit, signal } from '@angular/core';

import { DatePipe } from '@angular/common';

import { Router } from '@angular/router';

import { forkJoin } from 'rxjs';

import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

import { CampaignService } from '../../../campaigns/data-access/campaign.service';
import { SubmarineService } from '../../../submarines/data-access/submarine.service';
import { SimulationHistoryService } from '../../../simulations/data-access/simulation-history.service';
import { PatrolService } from '../../../patrols/data-access/patrol.service';

import { SimulationHistoryRecord } from '../../../simulations/models/simulation-history.model';

@Component({
  selector: 'app-dashboard',
  imports: [
    DatePipe,
    MatButtonModule,
    MatCardModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
  ],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss',
})
export class Dashboard implements OnInit {

  readonly loading = signal(true);
  readonly loadError = signal(false);

  readonly totalCampaigns = signal(0);
  readonly activeCampaigns = signal(0);
  readonly finishedCampaigns = signal(0);
  readonly abandonedCampaigns = signal(0);

  readonly totalSubmarines = signal(0);
  readonly activeSubmarines = signal(0);
  readonly refitSubmarines = signal(0);
  readonly damagedSubmarines = signal(0);
  readonly retiredSubmarines = signal(0);
  readonly totalSimulations = signal(0);

  readonly recentSimulations =
    signal<SimulationHistoryRecord[]>([]);

  readonly openingPatrol =
    signal<number | null>(null);

  constructor(
    private readonly campaignService: CampaignService,
    private readonly submarineService: SubmarineService,
    private readonly simulationHistoryService: SimulationHistoryService,
    private readonly patrolService: PatrolService,
    private readonly router: Router,
    private readonly snackBar: MatSnackBar,
  ) {}

  ngOnInit(): void {
    this.loadDashboard();
  }

  private loadDashboard(): void {
    this.loading.set(true);
    this.loadError.set(false);

    forkJoin({
      campaigns: this.campaignService.getCampaigns(
        0,
        1,
        'id',
        'asc',
      ),

      activeCampaigns:
        this.campaignService.getCampaignsByStatus(
          'ACTIVE',
        ),

      finishedCampaigns:
        this.campaignService.getCampaignsByStatus(
          'FINISHED',
        ),

      abandonedCampaigns:
        this.campaignService.getCampaignsByStatus(
          'ABANDONED',
        ),

      submarines:
        this.submarineService.getSubmarines(),

      simulations:
        this.simulationHistoryService.getHistory(
          0,
          5,
        ),
    }).subscribe({
      next: ({
        campaigns,
        activeCampaigns,
        finishedCampaigns,
        abandonedCampaigns,
        submarines,
        simulations,
      }) => {
        this.totalCampaigns.set(
          campaigns.totalElements,
        );

        this.activeCampaigns.set(
          activeCampaigns.length,
        );

        this.finishedCampaigns.set(
          finishedCampaigns.length,
        );

        this.abandonedCampaigns.set(
          abandonedCampaigns.length,
        );

        this.totalSubmarines.set(
          submarines.length,
        );

        this.activeSubmarines.set(
          submarines.filter(
            (submarine) => submarine.status === 'ACTIVE',
          ).length,
        );

        this.refitSubmarines.set(
          submarines.filter(
            (submarine) => submarine.status === 'REFIT',
          ).length,
        );

        this.damagedSubmarines.set(
          submarines.filter(
            (submarine) => submarine.status === 'DAMAGED',
          ).length,
        );

        this.retiredSubmarines.set(
          submarines.filter(
            (submarine) => submarine.status === 'RETIRED',
          ).length,
        );

        this.totalSimulations.set(
          simulations.totalElements,
        );

        this.recentSimulations.set(
          simulations.content,
        );

        this.loading.set(false);
      },

      error: () => {
        this.loading.set(false);
        this.loadError.set(true);
      },
    });
  }

  refresh(): void {
    this.loadDashboard();
  }

  openCampaigns(): void {
    this.router.navigate([
      '/campaigns',
    ]);
  }

  openCampaignsByStatus(
    status: 'ACTIVE' | 'FINISHED' | 'ABANDONED',
    event: Event,
  ): void {
    event.stopPropagation();

    this.router.navigate(
      ['/campaigns'],
      {
        queryParams: {
          status,
        },
      },
    );
  }

  openSubmarines(): void {
    this.router.navigate([
      '/submarines',
    ]);
  }

  openSimulations(): void {
    this.router.navigate([
      '/simulations',
    ]);
  }

  openSimulationPatrol(
    simulation: SimulationHistoryRecord,
  ): void {
    if (this.openingPatrol() !== null) {
      return;
    }

    this.openingPatrol.set(
      simulation.patrolId,
    );

    this.patrolService
      .getPatrol(
        simulation.patrolId,
      )
      .subscribe({
        next: (patrol) => {
          this.openingPatrol.set(null);

          this.router.navigate([
            '/campaigns',
            patrol.campaignId,
            'patrols',
            patrol.id,
          ]);
        },

        error: () => {
          this.openingPatrol.set(null);

          this.snackBar.open(
            'Unable to open patrol.',
            'Close',
            {
              duration: 5000,
            },
          );
        },
      });
  }

  outcomeClass(
    outcome: string,
  ): string {
    return `outcome-${outcome.toLowerCase()}`;
  }

  finalStateClass(
    state: string,
  ): string {
    return `state-${state.toLowerCase()}`;
  }
}
