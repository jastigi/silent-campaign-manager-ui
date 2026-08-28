import { Component, inject, signal } from '@angular/core';

import { Router } from '@angular/router';

import { MatButtonModule } from '@angular/material/button';

import { MatCardModule } from '@angular/material/card';

import { MatFormFieldModule } from '@angular/material/form-field';

import { MatIconModule } from '@angular/material/icon';

import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import { MatSelectModule } from '@angular/material/select';

import { MatTableModule } from '@angular/material/table';

import { SubmarineService } from '../../data-access/submarine.service';

import {
  Submarine,
  SubmarineRole,
  SubmarineStatus,
} from '../../models/submarine.model';

@Component({
  selector: 'app-submarine-list',
  imports: [
    MatButtonModule,
    MatCardModule,
    MatFormFieldModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatSelectModule,
    MatTableModule,
  ],
  templateUrl: './submarine-list.html',
  styleUrl: './submarine-list.scss',
})
export class SubmarineList {
  private readonly submarineService = inject(SubmarineService);

  private readonly router = inject(Router);

  readonly submarines = signal<Submarine[]>([]);

  readonly loading = signal(true);

  readonly loadError = signal(false);

  readonly allSubmarines =
    signal<Submarine[]>([]);

  readonly selectedStatus =
    signal<SubmarineStatus | 'ALL'>('ALL');

  readonly selectedRole =
    signal<SubmarineRole | 'ALL'>('ALL');

  readonly statusOptions: {
    value: SubmarineStatus | 'ALL';
    label: string;
  }[] = [
    { value: 'ALL', label: 'All statuses' },
    { value: 'ACTIVE', label: 'Active' },
    { value: 'REFIT', label: 'Refit' },
    { value: 'DAMAGED', label: 'Damaged' },
    { value: 'RETIRED', label: 'Retired' },
  ];

  readonly roleOptions: {
    value: SubmarineRole | 'ALL';
    label: string;
  }[] = [
    { value: 'ALL', label: 'All roles' },
    { value: 'SSBN', label: 'SSBN' },
    { value: 'SSN', label: 'SSN' },
  ];

  readonly displayedColumns = ['id', 'name', 'type', 'submarineClass', 'nation', 'role', 'status'];

  constructor() {
    this.loadSubmarines();
  }

  private loadSubmarines(): void {
    this.loading.set(true);
    this.loadError.set(false);

    this.submarineService.getSubmarines().subscribe({
      next: (submarines) => {
        this.allSubmarines.set(submarines);

        this.applyFilters();

        this.loading.set(false);
      },

      error: () => {
        this.loading.set(false);
        this.loadError.set(true);
      },
    });
  }

  onStatusChange(
    status: SubmarineStatus | 'ALL',
  ): void {
    this.selectedStatus.set(status);

    this.applyFilters();
  }

  onRoleChange(
    role: SubmarineRole | 'ALL',
  ): void {
    this.selectedRole.set(role);

    this.applyFilters();
  }

  clearFilters(): void {
    this.selectedStatus.set('ALL');
    this.selectedRole.set('ALL');

    this.applyFilters();
  }

  private applyFilters(): void {
    const status =
      this.selectedStatus();

    const role =
      this.selectedRole();

    const filtered =
      this.allSubmarines().filter(
        (submarine) => {
          const matchesStatus =
            status === 'ALL' ||
            submarine.status === status;

          const matchesRole =
            role === 'ALL' ||
            submarine.submarineRole === role;

          return (
            matchesStatus &&
            matchesRole
          );
        },
      );

    this.submarines.set(filtered);
  }

  openSubmarine(submarine: Submarine): void {
    this.router.navigate(['/submarines', submarine.id]);
  }

  refresh(): void {
    this.loadSubmarines();
  }

  createSubmarine(): void {
    this.router.navigate(['/submarines/new']);
  }

  statusClass(status: SubmarineStatus): string {
    return `submarine-status-${status.toLowerCase()}`;
  }
}
