import { Component, inject, signal } from '@angular/core';

import { DatePipe } from '@angular/common';

import { ActivatedRoute, Router } from '@angular/router';

import { MatButtonModule } from '@angular/material/button';

import { MatCardModule } from '@angular/material/card';

import { MatIconModule } from '@angular/material/icon';

import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

import { MatTableModule } from '@angular/material/table';

import { PatrolService } from '../../data-access/patrol.service';

import {
  MissionEvaluation,
  MissionStatus,
  PatrolReport,
  PatrolResult,
} from '../../models/patrol.model';

import { Contact, NationAlignment, ThreatLevel } from '../../models/contact.model';

@Component({
  selector: 'app-patrol-detail',
  imports: [
    DatePipe,
    MatButtonModule,
    MatCardModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatTableModule,
  ],
  templateUrl: './patrol-detail.html',
  styleUrl: './patrol-detail.scss',
})
export class PatrolDetail {
  private readonly route = inject(ActivatedRoute);

  private readonly router = inject(Router);

  private readonly patrolService = inject(PatrolService);

  private readonly snackBar = inject(MatSnackBar);

  readonly report = signal<PatrolReport | null>(null);

  readonly contacts = signal<Contact[]>([]);

  readonly evaluation = signal<MissionEvaluation | null>(null);

  readonly loading = signal(true);

  readonly loadError = signal(false);

  readonly closing = signal(false);

  readonly deleting = signal(false);

  readonly contactColumns = ['name', 'type', 'nation', 'alignment', 'threat', 'confidence'];

  private campaignId = 0;

  constructor() {
    const campaignId = Number(this.route.snapshot.paramMap.get('campaignId'));

    const patrolId = Number(this.route.snapshot.paramMap.get('patrolId'));

    if (
      !Number.isInteger(campaignId) ||
      campaignId <= 0 ||
      !Number.isInteger(patrolId) ||
      patrolId <= 0
    ) {
      this.loading.set(false);
      this.loadError.set(true);

      return;
    }

    this.campaignId = campaignId;

    this.loadPatrol(campaignId, patrolId);
  }

  private loadPatrol(campaignId: number, patrolId: number): void {
    this.loading.set(true);
    this.loadError.set(false);

    this.patrolService.getPatrolReport(campaignId, patrolId).subscribe({
      next: (report) => {
        this.report.set(report);

        this.loadContacts(campaignId, patrolId);

        this.loadEvaluation(campaignId, patrolId);
      },

      error: () => {
        this.loading.set(false);
        this.loadError.set(true);
      },
    });
  }

  private loadContacts(campaignId: number, patrolId: number): void {
    this.patrolService.getPatrolContacts(campaignId, patrolId).subscribe({
      next: (contacts) => {
        this.contacts.set(contacts);

        this.finishLoading();
      },

      error: () => {
        this.finishLoading();
      },
    });
  }

  private loadEvaluation(campaignId: number, patrolId: number): void {
    this.patrolService.getMissionEvaluation(campaignId, patrolId).subscribe({
      next: (evaluation) => {
        this.evaluation.set(evaluation);

        this.finishLoading();
      },

      error: () => {
        this.finishLoading();
      },
    });
  }

  private finishLoading(): void {
    if (this.report()) {
      this.loading.set(false);
    }
  }

  editPatrol(): void {
    const report = this.report();

    if (!report || report.missionStatus !== null) {
      return;
    }

    this.router.navigate(['/campaigns', this.campaignId, 'patrols', report.patrolId, 'edit']);
  }

  deletePatrol(): void {
    const report = this.report();

    if (!report || report.missionStatus !== null || this.deleting()) {
      return;
    }

    const confirmed = window.confirm(
      `Delete patrol "${report.patrolName}"?\n\nThis action cannot be undone.`,
    );

    if (!confirmed) {
      return;
    }

    this.deleting.set(true);

    this.patrolService.deletePatrol(this.campaignId, report.patrolId).subscribe({
      next: () => {
        this.deleting.set(false);

        this.snackBar.open('Patrol deleted successfully.', 'Close', {
          duration: 4000,
        });

        this.router.navigate(['/campaigns', this.campaignId]);
      },

      error: (error) => {
        this.deleting.set(false);

        const message = error?.error?.message ?? 'Unable to delete patrol.';

        this.snackBar.open(message, 'Close', {
          duration: 6000,
        });
      },
    });
  }

  closePatrol(): void {
    const report = this.report();

    if (!report || report.missionStatus !== null || this.closing() || this.deleting()) {
      return;
    }

    const confirmed = window.confirm(
      `Close patrol "${report.patrolName}"?\n\nThe mission result will be evaluated and persisted.`,
    );

    if (!confirmed) {
      return;
    }

    this.closing.set(true);

    this.patrolService.closePatrol(this.campaignId, report.patrolId).subscribe({
      next: (patrol) => {
        this.closing.set(false);

        this.snackBar.open(
          `Patrol closed: ${this.formatValue(patrol.result ?? 'PENDING')}.`,
          'Close',
          {
            duration: 5000,
          },
        );

        this.loadPatrol(this.campaignId, report.patrolId);
      },

      error: (error) => {
        this.closing.set(false);

        const message = error?.error?.message ?? 'Unable to close patrol.';

        this.snackBar.open(message, 'Close', {
          duration: 6000,
        });
      },
    });
  }

  back(): void {
    this.router.navigate(['/campaigns', this.campaignId]);
  }

  missionStatusClass(status: MissionStatus | null): string {
    if (!status) {
      return 'mission-status-pending';
    }

    return `mission-status-${status.toLowerCase().replaceAll('_', '-')}`;
  }

  patrolResultClass(result: PatrolResult): string {
    return `patrol-result-${result.toLowerCase().replaceAll('_', '-')}`;
  }

  threatClass(threat: ThreatLevel): string {
    return `threat-${threat.toLowerCase()}`;
  }

  alignmentClass(alignment: NationAlignment): string {
    return `alignment-${alignment.toLowerCase()}`;
  }

  formatValue(value: string): string {
    return value.replaceAll('_', ' ');
  }
}
