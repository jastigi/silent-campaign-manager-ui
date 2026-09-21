import { TestBed } from '@angular/core/testing';
import { ActivatedRoute, Router } from '@angular/router';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

import { of, throwError } from 'rxjs';

import { CampaignForm } from './campaign-form';
import { CampaignService } from '../../data-access/campaign.service';

describe('CampaignForm', () => {
  const campaignServiceMock = {
    getCampaignById: vi.fn(),
    createCampaign: vi.fn(),
    updateCampaign: vi.fn(),
  };

  const routerMock = {
    navigate: vi.fn(),
  };

  const snackBarMock = {
    open: vi.fn(),
  };

  const activatedRouteMock = {
    snapshot: {
      paramMap: {
        get: vi.fn(),
      },
    },
  };

  beforeEach(() => {
    TestBed.overrideComponent(CampaignForm, {
      remove: {
        imports: [MatSnackBarModule],
      },
    });

    vi.clearAllMocks();

    activatedRouteMock.snapshot.paramMap.get.mockReturnValue(
      null,
    );

    TestBed.configureTestingModule({
      imports: [
        CampaignForm,
      ],
      providers: [
        {
          provide: CampaignService,
          useValue: campaignServiceMock,
        },
        {
          provide: Router,
          useValue: routerMock,
        },
        {
          provide: ActivatedRoute,
          useValue: activatedRouteMock,
        },
        {
          provide: MatSnackBar,
          useValue: snackBarMock,
        },
      ],
    });
  });

  it('should initialize in create mode when no campaign id is provided', () => {
    const fixture =
      TestBed.createComponent(CampaignForm);

    const component =
      fixture.componentInstance;

    expect(
      component.editMode(),
    ).toBe(false);

    expect(
      component.loading(),
    ).toBe(false);

    expect(
      component.loadError(),
    ).toBe(false);

    expect(
      component.campaign(),
    ).toBeNull();

    expect(
      campaignServiceMock.getCampaignById,
    ).not.toHaveBeenCalled();

    expect(
      component.form.getRawValue(),
    ).toEqual({
      name: '',
      description: '',
      startDate: '',
    });
  }, 30000);

  it('should initialize in edit mode and load the campaign', () => {
    activatedRouteMock.snapshot.paramMap.get.mockImplementation(
      (name: string) => {
        if (name === 'id') {
          return '1';
        }

        return null;
      },
    );

    campaignServiceMock.getCampaignById.mockReturnValue(
      of({
        id: 1,
        name: 'North Atlantic Campaign',
        description: 'Cold War submarine operations.',
        startDate: '1984-01-01',
        status: 'ACTIVE',
      }),
    );

    const fixture =
      TestBed.createComponent(CampaignForm);

    const component =
      fixture.componentInstance;

    expect(
      component.editMode(),
    ).toBe(true);

    expect(
      campaignServiceMock.getCampaignById,
    ).toHaveBeenCalledWith(1);

    expect(
      component.campaign(),
    ).toEqual({
      id: 1,
      name: 'North Atlantic Campaign',
      description: 'Cold War submarine operations.',
      startDate: '1984-01-01',
      status: 'ACTIVE',
    });

    expect(
      component.form.getRawValue(),
    ).toEqual({
      name: 'North Atlantic Campaign',
      description: 'Cold War submarine operations.',
      startDate: '1984-01-01',
    });

    expect(
      component.loading(),
    ).toBe(false);

    expect(
      component.loadError(),
    ).toBe(false);
  }, 30000);

  it('should report a load error when the campaign id is invalid', () => {
    activatedRouteMock.snapshot.paramMap.get.mockImplementation(
      (name: string) => {
        if (name === 'id') {
          return 'invalid';
        }

        return null;
      },
    );

    const fixture = TestBed.createComponent(CampaignForm);
    const component = fixture.componentInstance;

    expect(component.editMode()).toBe(false);
    expect(component.loading()).toBe(false);
    expect(component.loadError()).toBe(true);
    expect(component.campaign()).toBeNull();

    expect(
      campaignServiceMock.getCampaignById,
    ).not.toHaveBeenCalled();
  }, 30000);

  it('should redirect when trying to edit a finished campaign', () => {
    activatedRouteMock.snapshot.paramMap.get.mockImplementation(
      (name: string) => {
        if (name === 'id') {
          return '1';
        }

        return null;
      },
    );

    const finishedCampaign = {
      id: 1,
      name: 'North Atlantic Patrols',
      description: 'SSBN Operations 1984',
      startDate: '2026-06-12',
      status: 'FINISHED' as const,
    };

    campaignServiceMock.getCampaignById.mockReturnValue(
      of(finishedCampaign),
    );

    const fixture = TestBed.createComponent(CampaignForm);
    const component = fixture.componentInstance;

    expect(campaignServiceMock.getCampaignById).toHaveBeenCalledWith(1);

    expect(component.editMode()).toBe(true);
    expect(component.loading()).toBe(false);
    expect(component.loadError()).toBe(false);
    expect(component.campaign()).toEqual(finishedCampaign);

    expect(snackBarMock.open).toHaveBeenCalledWith(
      'Only active campaigns can be edited.',
      'Close',
      { duration: 5000 },
    );

    expect(routerMock.navigate).toHaveBeenCalledWith(['/campaigns', 1]);

    expect(campaignServiceMock.updateCampaign).not.toHaveBeenCalled();
  }, 30000);

  it('should not save an invalid form', () => {
    const fixture = TestBed.createComponent(CampaignForm);
    const component = fixture.componentInstance;

    // El formulario de creación comienza con name y startDate vacíos.
    expect(component.form.invalid).toBe(true);

    component.save();

    expect(component.form.controls.name.touched).toBe(true);
    expect(component.form.controls.startDate.touched).toBe(true);

    expect(component.saving()).toBe(false);
    expect(campaignServiceMock.createCampaign).not.toHaveBeenCalled();
    expect(campaignServiceMock.updateCampaign).not.toHaveBeenCalled();
    expect(routerMock.navigate).not.toHaveBeenCalled();
  }, 30000);

  it('should create a campaign and navigate to its detail', () => {
    const createdCampaign = {
      id: 7,
      name: 'North Atlantic Patrols',
      description: 'SSBN Operations 1984',
      startDate: '2026-06-12',
      status: 'ACTIVE' as const,
    };

    campaignServiceMock.createCampaign.mockReturnValue(
      of(createdCampaign),
    );

    const fixture = TestBed.createComponent(CampaignForm);
    const component = fixture.componentInstance;

    component.form.setValue({
      name: '  North Atlantic Patrols  ',
      description: '  SSBN Operations 1984  ',
      startDate: '2026-06-12',
    });

    expect(component.form.valid).toBe(true);

    component.save();

    expect(campaignServiceMock.createCampaign).toHaveBeenCalledWith({
      name: 'North Atlantic Patrols',
      description: 'SSBN Operations 1984',
      startDate: '2026-06-12',
      status: 'ACTIVE',
    });

    expect(campaignServiceMock.updateCampaign).not.toHaveBeenCalled();
    expect(component.saving()).toBe(false);

    expect(snackBarMock.open).toHaveBeenCalledWith(
      'Campaign created successfully.',
      'Close',
      { duration: 4000 },
    );

    expect(routerMock.navigate).toHaveBeenCalledWith(['/campaigns', 7]);
  }, 30000);

  it('should show the backend error when campaign creation fails', () => {
    campaignServiceMock.createCampaign.mockReturnValue(
      throwError(() => ({
        error: {
          message: 'Campaign name already exists.',
        },
      })),
    );

    const fixture = TestBed.createComponent(CampaignForm);
    const component = fixture.componentInstance;

    component.form.setValue({
      name: 'North Atlantic Patrols',
      description: 'SSBN Operations 1984',
      startDate: '2026-06-12',
    });

    component.save();

    expect(campaignServiceMock.createCampaign).toHaveBeenCalledWith({
      name: 'North Atlantic Patrols',
      description: 'SSBN Operations 1984',
      startDate: '2026-06-12',
      status: 'ACTIVE',
    });

    expect(component.saving()).toBe(false);

    expect(snackBarMock.open).toHaveBeenCalledWith(
      'Campaign name already exists.',
      'Close',
      { duration: 6000 },
    );

    expect(routerMock.navigate).not.toHaveBeenCalled();
  }, 30000);

  it('should update an existing campaign and navigate to its detail', () => {
    activatedRouteMock.snapshot.paramMap.get.mockImplementation(
      (name: string) => (name === 'id' ? '1' : null),
    );

    const existingCampaign = {
      id: 1,
      name: 'North Atlantic Patrols',
      description: 'SSBN Operations 1984',
      startDate: '2026-06-12',
      status: 'ACTIVE' as const,
    };

    const updatedCampaign = {
      ...existingCampaign,
      name: 'Updated North Atlantic Patrols',
      description: 'Updated mission description',
    };

    campaignServiceMock.getCampaignById.mockReturnValue(
      of(existingCampaign),
    );

    campaignServiceMock.updateCampaign.mockReturnValue(
      of(updatedCampaign),
    );

    const fixture = TestBed.createComponent(CampaignForm);
    const component = fixture.componentInstance;

    component.form.setValue({
      name: '  Updated North Atlantic Patrols  ',
      description: '  Updated mission description  ',
      startDate: '2026-06-12',
    });

    component.save();

    expect(campaignServiceMock.updateCampaign).toHaveBeenCalledWith(1, {
      name: 'Updated North Atlantic Patrols',
      description: 'Updated mission description',
      startDate: '2026-06-12',
      status: 'ACTIVE',
    });

    expect(campaignServiceMock.createCampaign).not.toHaveBeenCalled();
    expect(component.saving()).toBe(false);

    expect(snackBarMock.open).toHaveBeenCalledWith(
      'Campaign updated successfully.',
      'Close',
      { duration: 4000 },
    );

    expect(routerMock.navigate).toHaveBeenCalledWith(['/campaigns', 1]);
  }, 30000);

  it('should show the backend error when campaign update fails', () => {
    activatedRouteMock.snapshot.paramMap.get.mockImplementation(
      (name: string) => (name === 'id' ? '1' : null),
    );

    const existingCampaign = {
      id: 1,
      name: 'North Atlantic Patrols',
      description: 'SSBN Operations 1984',
      startDate: '2026-06-12',
      status: 'ACTIVE' as const,
    };

    campaignServiceMock.getCampaignById.mockReturnValue(
      of(existingCampaign),
    );

    campaignServiceMock.updateCampaign.mockReturnValue(
      throwError(() => ({
        error: {
          message: 'Unable to update this campaign.',
        },
      })),
    );

    const fixture = TestBed.createComponent(CampaignForm);
    const component = fixture.componentInstance;

    component.form.setValue({
      name: 'Updated North Atlantic Patrols',
      description: 'Updated mission description',
      startDate: '2026-06-12',
    });

    component.save();

    expect(campaignServiceMock.updateCampaign).toHaveBeenCalledWith(1, {
      name: 'Updated North Atlantic Patrols',
      description: 'Updated mission description',
      startDate: '2026-06-12',
      status: 'ACTIVE',
    });

    expect(campaignServiceMock.createCampaign).not.toHaveBeenCalled();
    expect(component.saving()).toBe(false);

    expect(snackBarMock.open).toHaveBeenCalledWith(
      'Unable to update this campaign.',
      'Close',
      { duration: 6000 },
    );

    expect(routerMock.navigate).not.toHaveBeenCalled();
  }, 30000);

  it('should navigate to campaign list when cancelling creation', () => {
    const fixture = TestBed.createComponent(CampaignForm);
    const component = fixture.componentInstance;

    expect(component.editMode()).toBe(false);

    component.cancel();

    expect(routerMock.navigate).toHaveBeenCalledWith(['/campaigns']);

    expect(campaignServiceMock.createCampaign).not.toHaveBeenCalled();
    expect(campaignServiceMock.updateCampaign).not.toHaveBeenCalled();
  }, 30000);

  it('should navigate to campaign detail when cancelling edition', () => {
    activatedRouteMock.snapshot.paramMap.get.mockImplementation(
      (name: string) => (name === 'id' ? '1' : null),
    );

    const existingCampaign = {
      id: 1,
      name: 'North Atlantic Patrols',
      description: 'SSBN Operations 1984',
      startDate: '2026-06-12',
      status: 'ACTIVE' as const,
    };

    campaignServiceMock.getCampaignById.mockReturnValue(
      of(existingCampaign),
    );

    const fixture = TestBed.createComponent(CampaignForm);
    const component = fixture.componentInstance;

    expect(component.editMode()).toBe(true);

    component.cancel();

    expect(routerMock.navigate).toHaveBeenCalledWith(['/campaigns', 1]);

    expect(campaignServiceMock.createCampaign).not.toHaveBeenCalled();
    expect(campaignServiceMock.updateCampaign).not.toHaveBeenCalled();
  }, 30000);
});