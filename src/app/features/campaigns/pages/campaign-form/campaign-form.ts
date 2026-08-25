import { Component, inject, signal } from '@angular/core';

import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';

import { ActivatedRoute, Router } from '@angular/router';

import { MatButtonModule } from '@angular/material/button';

import { MatCardModule } from '@angular/material/card';

import { MatFormFieldModule } from '@angular/material/form-field';

import { MatIconModule } from '@angular/material/icon';

import { MatInputModule } from '@angular/material/input';

import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

import { CampaignService } from '../../data-access/campaign.service';

import { Campaign, CampaignRequest } from '../../models/campaign.model';

@Component({
  selector: 'app-campaign-form',
  imports: [
    ReactiveFormsModule,
    MatButtonModule,
    MatCardModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
  ],
  templateUrl: './campaign-form.html',
  styleUrl: './campaign-form.scss',
})
export class CampaignForm {
  private readonly fb = inject(FormBuilder);

  private readonly router = inject(Router);

  private readonly route = inject(ActivatedRoute);

  private readonly campaignService = inject(CampaignService);

  private readonly snackBar = inject(MatSnackBar);

  readonly saving = signal(false);

  readonly loading = signal(false);

  readonly loadError = signal(false);

  readonly editMode = signal(false);

  readonly campaign = signal<Campaign | null>(null);

  private campaignId: number | null = null;

  readonly form = this.fb.nonNullable.group({
    name: ['', [Validators.required, Validators.maxLength(100)]],

    description: ['', Validators.maxLength(500)],

    startDate: ['', Validators.required],
  });

  constructor() {
    const idParam = this.route.snapshot.paramMap.get('id');

    if (idParam !== null) {
      const id = Number(idParam);

      if (!Number.isInteger(id) || id <= 0) {
        this.loadError.set(true);
        return;
      }

      this.campaignId = id;
      this.editMode.set(true);

      this.loadCampaign(id);
    }
  }

  cancel(): void {
    if (this.editMode() && this.campaignId !== null) {
      this.router.navigate(['/campaigns', this.campaignId]);

      return;
    }

    this.router.navigate(['/campaigns']);
  }

  save(): void {
    if (this.form.invalid || this.saving() || this.loading()) {
      this.form.markAllAsTouched();

      return;
    }

    const value = this.form.getRawValue();

    const request: CampaignRequest = {
      name: value.name.trim(),

      description: value.description.trim() || null,

      startDate: value.startDate,

      status: 'ACTIVE',
    };

    if (this.editMode() && this.campaignId !== null) {
      this.updateCampaign(this.campaignId, request);

      return;
    }

    this.createCampaign(request);
  }

  private loadCampaign(id: number): void {
    this.loading.set(true);
    this.loadError.set(false);

    this.campaignService.getCampaignById(id).subscribe({
      next: (campaign) => {
        this.loading.set(false);

        this.campaign.set(campaign);

        if (campaign.status !== 'ACTIVE') {
          this.snackBar.open('Only active campaigns can be edited.', 'Close', {
            duration: 5000,
          });

          this.router.navigate(['/campaigns', campaign.id]);

          return;
        }

        this.form.patchValue({
          name: campaign.name,

          description: campaign.description ?? '',

          startDate: campaign.startDate,
        });
      },

      error: () => {
        this.loading.set(false);
        this.loadError.set(true);
      },
    });
  }

  private createCampaign(request: CampaignRequest): void {
    this.saving.set(true);

    this.campaignService.createCampaign(request).subscribe({
      next: (campaign) => {
        this.saving.set(false);

        this.snackBar.open('Campaign created successfully.', 'Close', {
          duration: 4000,
        });

        this.router.navigate(['/campaigns', campaign.id]);
      },

      error: (error) => {
        this.saving.set(false);

        this.showSaveError(error, 'Unable to create campaign.');
      },
    });
  }

  private updateCampaign(id: number, request: CampaignRequest): void {
    this.saving.set(true);

    this.campaignService.updateCampaign(id, request).subscribe({
      next: (campaign) => {
        this.saving.set(false);

        this.snackBar.open('Campaign updated successfully.', 'Close', {
          duration: 4000,
        });

        this.router.navigate(['/campaigns', campaign.id]);
      },

      error: (error) => {
        this.saving.set(false);

        this.showSaveError(error, 'Unable to update campaign.');
      },
    });
  }

  private showSaveError(error: any, fallbackMessage: string): void {
    const message = error?.error?.message ?? fallbackMessage;

    this.snackBar.open(message, 'Close', {
      duration: 6000,
    });
  }
}
