import { Component, inject, signal } from '@angular/core';

import { Router } from '@angular/router';

import { MatButtonModule } from '@angular/material/button';

import { MatCardModule } from '@angular/material/card';

import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import { MatTableModule } from '@angular/material/table';

import { SubmarineService } from '../../data-access/submarine.service';

import { Submarine, SubmarineStatus } from '../../models/submarine.model';

@Component({
  selector: 'app-submarine-list',
  imports: [MatButtonModule, MatCardModule, MatProgressSpinnerModule, MatTableModule],
  templateUrl: './submarine-list.html',
  styleUrl: './submarine-list.scss',
})
export class SubmarineList {
  private readonly submarineService = inject(SubmarineService);

  private readonly router = inject(Router);

  readonly submarines = signal<Submarine[]>([]);

  readonly loading = signal(true);

  readonly loadError = signal(false);

  readonly displayedColumns = ['id', 'name', 'type', 'submarineClass', 'nation', 'role', 'status'];

  constructor() {
    this.loadSubmarines();
  }

  private loadSubmarines(): void {
    this.loading.set(true);
    this.loadError.set(false);

    this.submarineService.getSubmarines().subscribe({
      next: (submarines) => {
        this.submarines.set(submarines);

        this.loading.set(false);
      },

      error: () => {
        this.loading.set(false);
        this.loadError.set(true);
      },
    });
  }

  openSubmarine(submarine: Submarine): void {
    this.router.navigate(['/submarines', submarine.id]);
  }

  createSubmarine(): void {
    this.router.navigate(['/submarines/new']);
  }

  statusClass(status: SubmarineStatus): string {
    return `submarine-status-${status.toLowerCase()}`;
  }
}
