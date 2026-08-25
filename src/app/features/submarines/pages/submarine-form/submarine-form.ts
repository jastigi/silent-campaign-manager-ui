import { Component, inject, signal } from '@angular/core';

import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

import { ActivatedRoute, Router } from '@angular/router';

import { MatButtonModule } from '@angular/material/button';

import { MatCardModule } from '@angular/material/card';

import { MatFormFieldModule } from '@angular/material/form-field';

import { MatIconModule } from '@angular/material/icon';

import { MatInputModule } from '@angular/material/input';

import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import { MatSelectModule } from '@angular/material/select';

import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

import { SubmarineService } from '../../data-access/submarine.service';

import {
  SubmarineClass,
  SubmarineRequest,
  SubmarineRole,
  SubmarineStatus,
  SubmarineType,
} from '../../models/submarine.model';

@Component({
  selector: 'app-submarine-form',
  imports: [
    ReactiveFormsModule,
    MatButtonModule,
    MatCardModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatProgressSpinnerModule,
    MatSelectModule,
    MatSnackBarModule,
  ],
  templateUrl: './submarine-form.html',
  styleUrl: './submarine-form.scss',
})
export class SubmarineForm {
  private readonly route = inject(ActivatedRoute);

  private readonly router = inject(Router);

  private readonly submarineService = inject(SubmarineService);

  private readonly snackBar = inject(MatSnackBar);

  readonly saving = signal(false);

  readonly loading = signal(false);

  readonly loadError = signal(false);

  readonly submarineId = signal<number | null>(null);

  readonly submarineTypes: SubmarineType[] = ['SSBN', 'SSN', 'SSGN', 'SSK'];

  readonly submarineClasses: SubmarineClass[] = [
    'OHIO',
    'LOS_ANGELES',
    'STURGEON',
    'SEAWOLF',
    'RESOLUTION',
    'SWIFTSURE',
    'TRAFALGAR',
    'DELTA_IV',
    'TYPHOON',
    'VICTOR_III',
    'AKULA',
  ];

  readonly submarineStatuses: SubmarineStatus[] = ['ACTIVE', 'REFIT', 'DAMAGED', 'RETIRED'];

  readonly submarineRoles: SubmarineRole[] = ['SSBN', 'SSN'];

  readonly form = new FormGroup({
    name: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required],
    }),

    type: new FormControl<SubmarineType | null>(null, {
      validators: [Validators.required],
    }),

    submarineClass: new FormControl<SubmarineClass | null>(null, {
      validators: [Validators.required],
    }),

    nation: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required],
    }),

    status: new FormControl<SubmarineStatus | null>(null, {
      validators: [Validators.required],
    }),

    submarineRole: new FormControl<SubmarineRole | null>(null, {
      validators: [Validators.required],
    }),
  });

  constructor() {
    const idParam = this.route.snapshot.paramMap.get('id');

    if (idParam) {
      const id = Number(idParam);

      if (!Number.isFinite(id) || id <= 0) {
        this.loadError.set(true);

        return;
      }

      this.submarineId.set(id);

      this.loadSubmarine(id);
    }
  }

  get isEditMode(): boolean {
    return this.submarineId() !== null;
  }

  private loadSubmarine(id: number): void {
    this.loading.set(true);
    this.loadError.set(false);

    this.submarineService.getSubmarineById(id).subscribe({
      next: (submarine) => {
        this.form.patchValue({
          name: submarine.name,

          type: submarine.type,

          submarineClass: submarine.submarineClass,

          nation: submarine.nation,

          status: submarine.status,

          submarineRole: submarine.submarineRole,
        });

        this.loading.set(false);
      },

      error: () => {
        this.loading.set(false);
        this.loadError.set(true);
      },
    });
  }

  save(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();

      return;
    }

    const value = this.form.getRawValue();

    if (!value.type || !value.submarineClass || !value.status || !value.submarineRole) {
      return;
    }

    const request: SubmarineRequest = {
      name: value.name.trim(),

      type: value.type,

      submarineClass: value.submarineClass,

      nation: value.nation.trim(),

      status: value.status,

      submarineRole: value.submarineRole,
    };

    this.saving.set(true);

    const id = this.submarineId();

    const operation =
      id === null
        ? this.submarineService.createSubmarine(request)
        : this.submarineService.updateSubmarine(id, request);

    operation.subscribe({
      next: (submarine) => {
        this.saving.set(false);

        this.snackBar.open(
          id === null ? 'Submarine created successfully.' : 'Submarine updated successfully.',
          'Close',
          {
            duration: 4000,
          },
        );

        this.router.navigate(['/submarines', submarine.id]);
      },

      error: (error) => {
        this.saving.set(false);

        const message = error?.error?.message ?? 'Unable to save submarine.';

        this.snackBar.open(message, 'Close', {
          duration: 6000,
        });
      },
    });
  }

  cancel(): void {
    const id = this.submarineId();

    if (id !== null) {
      this.router.navigate(['/submarines', id]);

      return;
    }

    this.router.navigate(['/submarines']);
  }

  formatOption(value: string): string {
    return value.replaceAll('_', ' ');
  }
}
