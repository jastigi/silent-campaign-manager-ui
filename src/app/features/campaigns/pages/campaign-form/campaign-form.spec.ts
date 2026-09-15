import { TestBed } from '@angular/core/testing';
import { ActivatedRoute, Router } from '@angular/router';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

import { of } from 'rxjs';

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
});