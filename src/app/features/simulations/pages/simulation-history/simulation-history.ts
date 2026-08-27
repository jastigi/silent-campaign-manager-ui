import {
  Component,
  inject,
  signal,
} from '@angular/core';

import {
  DatePipe,
} from '@angular/common';

import {
  FormsModule,
} from '@angular/forms';

import {
  Router,
} from '@angular/router';

import {
  MatCardModule,
} from '@angular/material/card';

import {
  MatButtonModule,
} from '@angular/material/button';

import {
  MatFormFieldModule,
} from '@angular/material/form-field';

import {
  MatInputModule,
} from '@angular/material/input';

import {
  MatIconModule,
} from '@angular/material/icon';

import {
  MatPaginatorModule,
  PageEvent,
} from '@angular/material/paginator';

import {
  MatProgressSpinnerModule,
} from '@angular/material/progress-spinner';

import {
  MatTableModule,
} from '@angular/material/table';

import {
  MatSnackBar,
  MatSnackBarModule,
} from '@angular/material/snack-bar';

import {
  SimulationHistoryService,
} from '../../data-access/simulation-history.service';

import {
  PatrolSimulationState,
  SimulationHistoryRecord,
  SimulationOutcome,
} from '../../models/simulation-history.model';

import {
  PatrolService,
} from '../../../patrols/data-access/patrol.service';

@Component({
  selector: 'app-simulation-history',
  imports: [
    DatePipe,
    FormsModule,
    MatButtonModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    MatPaginatorModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatTableModule,
  ],
  templateUrl: './simulation-history.html',
  styleUrl: './simulation-history.scss',
})
export class SimulationHistory {
  private readonly simulationHistoryService =
    inject(SimulationHistoryService);

  private readonly patrolService =
    inject(PatrolService);

  private readonly router =
    inject(Router);

  private readonly snackBar =
    inject(MatSnackBar);

  readonly simulations =
    signal<SimulationHistoryRecord[]>([]);

  readonly loading =
    signal(true);

  readonly loadError =
    signal(false);

  readonly openingPatrol =
    signal<number | null>(null);

  readonly totalElements =
    signal(0);

  readonly pageIndex =
    signal(0);

  readonly pageSize =
    signal(10);

  readonly patrolFilter =
    signal('');

  readonly activePatrolId =
    signal<number | null>(null);

  readonly expandedSimulationId =
    signal<number | null>(null);

  readonly displayedColumns = [
    'id',
    'patrol',
    'outcome',
    'score',
    'finalState',
    'completionDate',
    'recordedAt',
    'actions',
  ];

  constructor() {
    this.loadHistory();
  }

  private loadHistory(): void {
    this.loading.set(true);
    this.loadError.set(false);

    const patrolId =
      this.activePatrolId();

    const request$ =
      patrolId !== null
        ? this.simulationHistoryService
            .getHistoryByPatrol(
              patrolId,
              this.pageIndex(),
              this.pageSize(),
            )
        : this.simulationHistoryService
            .getHistory(
              this.pageIndex(),
              this.pageSize(),
            );

    request$.subscribe({
      next: (response) => {
        this.simulations.set(
          response.content,
        );

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

  applyPatrolFilter(): void {
    const rawValue =
      this.patrolFilter().trim();

    if (!rawValue) {
      this.clearPatrolFilter();

      return;
    }

    const patrolId =
      Number(rawValue);

    if (
      !Number.isInteger(patrolId) ||
      patrolId <= 0
    ) {
      this.snackBar.open(
        'Enter a valid Patrol ID.',
        'Close',
        {
          duration: 4000,
        },
      );

      return;
    }

    this.activePatrolId.set(
      patrolId,
    );

    this.pageIndex.set(0);

    this.expandedSimulationId.set(
      null,
    );

    this.loadHistory();
  }

  clearPatrolFilter(): void {
    this.patrolFilter.set('');

    this.activePatrolId.set(null);

    this.pageIndex.set(0);

    this.expandedSimulationId.set(
      null,
    );

    this.loadHistory();
  }

  refresh(): void {
    this.expandedSimulationId.set(
      null,
    );

    this.loadHistory();
  }

  onPageChange(
    event: PageEvent,
  ): void {
    this.pageIndex.set(
      event.pageIndex,
    );

    this.pageSize.set(
      event.pageSize,
    );

    this.loadHistory();
  }

  toggleDetails(
    simulationId: number,
    event: MouseEvent,
  ): void {
    event.stopPropagation();

    this.expandedSimulationId.update(
      (currentId) =>
        currentId === simulationId
          ? null
          : simulationId,
    );
  }

  openPatrol(
    simulation: SimulationHistoryRecord,
  ): void {
    if (
      this.openingPatrol() !== null
    ) {
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

  simulationOutcomeClass(
    outcome: SimulationOutcome,
  ): string {
    return `simulation-outcome-${outcome
      .toLowerCase()
      .replaceAll('_', '-')}`;
  }

  simulationStateClass(
    state: PatrolSimulationState,
  ): string {
    return `simulation-state-${state
      .toLowerCase()
      .replaceAll('_', '-')}`;
  }

  formatValue(
    value: string,
  ): string {
    return value.replaceAll(
      '_',
      ' ',
    );
  }
}