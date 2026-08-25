import { Component, inject, signal } from '@angular/core';

import { ActivatedRoute, Router } from '@angular/router';

import { MatButtonModule } from '@angular/material/button';

import { MatCardModule } from '@angular/material/card';

import { MatIconModule } from '@angular/material/icon';

import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

import { SubmarineService } from '../../data-access/submarine.service';

import { Submarine, SubmarineStatus } from '../../models/submarine.model';

@Component({
  selector: 'app-submarine-detail',
  imports: [
    MatButtonModule,
    MatCardModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
  ],
  templateUrl: './submarine-detail.html',
  styleUrl: './submarine-detail.scss',
})
export class SubmarineDetail {
  private readonly route = inject(ActivatedRoute);

  private readonly router = inject(Router);

  private readonly submarineService = inject(SubmarineService);

  private readonly snackBar = inject(MatSnackBar);

  readonly submarine = signal<Submarine | null>(null);

  readonly loading = signal(true);

  readonly loadError = signal(false);

  readonly deleting = signal(false);

  constructor() {
    const id = Number(this.route.snapshot.paramMap.get('id'));

    if (!Number.isFinite(id) || id <= 0) {
      this.loading.set(false);
      this.loadError.set(true);

      return;
    }

    this.loadSubmarine(id);
  }

  private loadSubmarine(id: number): void {
    this.loading.set(true);
    this.loadError.set(false);

    this.submarineService.getSubmarineById(id).subscribe({
      next: (submarine) => {
        this.submarine.set(submarine);

        this.loading.set(false);
      },

      error: () => {
        this.loading.set(false);
        this.loadError.set(true);
      },
    });
  }

  back(): void {
    this.router.navigate(['/submarines']);
  }

  edit(): void {
    const submarine = this.submarine();

    if (!submarine) {
      return;
    }

    this.router.navigate(['/submarines', submarine.id, 'edit']);
  }

  delete(): void {
    const submarine = this.submarine();

    if (!submarine) {
      return;
    }

    const confirmed = window.confirm(`Delete submarine "${submarine.name}"?`);

    if (!confirmed) {
      return;
    }

    this.deleting.set(true);

    this.submarineService.deleteSubmarine(submarine.id).subscribe({
      next: () => {
        this.deleting.set(false);

        this.snackBar.open('Submarine deleted successfully.', 'Close', {
          duration: 4000,
        });

        this.router.navigate(['/submarines']);
      },

      error: (error) => {
        this.deleting.set(false);

        const message = error?.error?.message ?? 'Unable to delete submarine.';

        this.snackBar.open(message, 'Close', {
          duration: 6000,
        });
      },
    });
  }

  statusClass(status: SubmarineStatus): string {
    return `submarine-status-${status.toLowerCase()}`;
  }

  formatClass(submarineClass: string): string {
    return submarineClass.replaceAll('_', ' ');
  }
}
