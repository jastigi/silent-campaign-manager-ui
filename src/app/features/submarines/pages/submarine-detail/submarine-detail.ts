import { Component, inject, signal } from '@angular/core';

import { ActivatedRoute, Router } from '@angular/router';

import { MatButtonModule } from '@angular/material/button';

import { MatCardModule } from '@angular/material/card';

import { MatIconModule } from '@angular/material/icon';

import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import { SubmarineService } from '../../data-access/submarine.service';

import { Submarine, SubmarineStatus } from '../../models/submarine.model';

@Component({
  selector: 'app-submarine-detail',
  imports: [MatButtonModule, MatCardModule, MatIconModule, MatProgressSpinnerModule],
  templateUrl: './submarine-detail.html',
  styleUrl: './submarine-detail.scss',
})
export class SubmarineDetail {
  private readonly route = inject(ActivatedRoute);

  private readonly router = inject(Router);

  private readonly submarineService = inject(SubmarineService);

  readonly submarine = signal<Submarine | null>(null);

  readonly loading = signal(true);

  readonly loadError = signal(false);

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

  statusClass(status: SubmarineStatus): string {
    return `submarine-status-${status.toLowerCase()}`;
  }

  formatClass(submarineClass: string): string {
    return submarineClass.replaceAll('_', ' ');
  }
}
