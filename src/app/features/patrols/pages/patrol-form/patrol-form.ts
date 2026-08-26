import { Component, inject, signal } from '@angular/core';

import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';

import { ActivatedRoute, Router } from '@angular/router';

import { MatButtonModule } from '@angular/material/button';

import { MatCardModule } from '@angular/material/card';

import { MatFormFieldModule } from '@angular/material/form-field';

import { MatIconModule } from '@angular/material/icon';

import { MatInputModule } from '@angular/material/input';

import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import { MatSelectModule } from '@angular/material/select';

import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

import { PatrolService } from '../../data-access/patrol.service';

import { MissionType, PatrolRequest } from '../../models/patrol.model';

import { SubmarineService } from '../../../submarines/data-access/submarine.service';

import { Submarine } from '../../../submarines/models/submarine.model';

@Component({
  selector: 'app-patrol-form',
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
  templateUrl: './patrol-form.html',
  styleUrl: './patrol-form.scss',
})
export class PatrolForm {
  private readonly fb = inject(FormBuilder);

  private readonly route = inject(ActivatedRoute);

  private readonly router = inject(Router);

  private readonly patrolService = inject(PatrolService);

  private readonly submarineService = inject(SubmarineService);

  private readonly snackBar = inject(MatSnackBar);

  readonly saving = signal(false);

  readonly submarinesLoading = signal(true);

  readonly submarinesError = signal(false);

  readonly submarines = signal<Submarine[]>([]);

  readonly missionTypes: MissionType[] = [
    'DETERRENCE_PATROL',
    'FOLLOW_SSBN',
    'HUNT_SSN',
    'SURVEILLANCE',
    'INTELLIGENCE',
    'SPECIAL_OPERATION',
    'ESCORT',
    'TRAINING',
  ];

  private readonly campaignId: number;

  readonly form = this.fb.nonNullable.group({
    patrolName: ['', Validators.required],

    patrolDate: ['', Validators.required],

    area: [''],

    submarineId: [0, Validators.min(1)],

    missionType: ['' as MissionType, Validators.required],
  });

  constructor() {
    const campaignId = Number(this.route.snapshot.paramMap.get('campaignId'));

    if (!Number.isInteger(campaignId) || campaignId <= 0) {
      this.campaignId = 0;

      this.submarinesLoading.set(false);
      this.submarinesError.set(true);

      return;
    }

    this.campaignId = campaignId;

    this.loadSubmarines();
  }

  private loadSubmarines(): void {
    this.submarinesLoading.set(true);
    this.submarinesError.set(false);

    this.submarineService.getSubmarines().subscribe({
      next: (submarines) => {
        this.submarines.set(submarines);

        this.submarinesLoading.set(false);
      },

      error: () => {
        this.submarinesLoading.set(false);
        this.submarinesError.set(true);
      },
    });
  }

  save(): void {
    if (this.form.invalid || this.saving() || this.campaignId <= 0) {
      this.form.markAllAsTouched();

      return;
    }

    const value = this.form.getRawValue();

    const request: PatrolRequest = {
      patrolName: value.patrolName.trim(),

      patrolDate: value.patrolDate,

      area: value.area.trim() || null,

      submarineId: value.submarineId,

      missionType: value.missionType,
    };

    this.saving.set(true);

    this.patrolService.createPatrol(this.campaignId, request).subscribe({
      next: (patrol) => {
        this.saving.set(false);

        this.snackBar.open('Patrol created successfully.', 'Close', {
          duration: 4000,
        });

        this.router.navigate(['/campaigns', this.campaignId, 'patrols', patrol.id]);
      },

      error: (error) => {
        this.saving.set(false);

        const message = error?.error?.message ?? 'Unable to create patrol.';

        this.snackBar.open(message, 'Close', {
          duration: 6000,
        });
      },
    });
  }

  cancel(): void {
    this.router.navigate(['/campaigns', this.campaignId]);
  }

  formatValue(value: string): string {
    return value.replaceAll('_', ' ');
  }
}
