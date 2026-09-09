import { TestBed } from '@angular/core/testing';
import { ActivatedRoute, Router } from '@angular/router';

import { of, throwError } from 'rxjs';

import { CampaignList } from './campaign-list';

import { CampaignService } from '../../data-access/campaign.service';

import {
  Campaign,
} from '../../models/campaign.model';

describe('CampaignList', () => {
  const campaigns: Campaign[] = [
    {
      id: 1,
      name: 'North Atlantic Patrols',
      description: 'SSBN Operations',
      startDate: '1984-01-01',
      status: 'ACTIVE',
    },
    {
      id: 2,
      name: 'Arctic Shield',
      description: 'Arctic operations',
      startDate: '1985-01-01',
      status: 'FINISHED',
    },
  ];

  const campaignServiceMock = {
    getCampaigns: vi.fn(),
    getCampaignsByStatus: vi.fn(),
  };

  const routerMock = {
    navigate: vi.fn(),
  };

  const activatedRouteMock = {
    snapshot: {
      queryParamMap: {
        get: vi.fn(),
      },
    },
  };

  beforeEach(async () => {
    vi.clearAllMocks();

    activatedRouteMock.snapshot.queryParamMap.get.mockReturnValue(null);

    campaignServiceMock.getCampaigns.mockReturnValue(
      of({
        content: campaigns,
        totalElements: campaigns.length,
        totalPages: 1,
        size: 10,
        number: 0,
        first: true,
        last: true,
        empty: false,
      }),
    );

    campaignServiceMock.getCampaignsByStatus.mockReturnValue(
      of(campaigns),
    );

    TestBed.configureTestingModule({
      imports: [
        CampaignList,
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
      ],
    });

    await TestBed.compileComponents();
  });

  it('should load all campaigns by default', () => {
    const fixture =
      TestBed.createComponent(CampaignList);

    const component =
      fixture.componentInstance;

    expect(
      campaignServiceMock.getCampaigns,
    ).toHaveBeenCalledWith(
      0,
      10,
      'id',
      'asc',
    );

    expect(
      campaignServiceMock.getCampaignsByStatus,
    ).not.toHaveBeenCalled();

    expect(
      component.selectedStatus(),
    ).toBe('ALL');

    expect(
      component.campaigns(),
    ).toEqual(campaigns);

    expect(
      component.totalElements(),
    ).toBe(2);

    expect(
      component.loading(),
    ).toBe(false);

expect(
      component.loadError(),
    ).toBe(false);
  }, 30000);

  it('should load campaigns filtered by status from query params', () => {
    activatedRouteMock.snapshot.queryParamMap.get.mockReturnValue('ACTIVE');

    campaignServiceMock.getCampaignsByStatus.mockReturnValue(
      of([campaigns[0]]),
    );

    const fixture =
      TestBed.createComponent(CampaignList);

    const component =
      fixture.componentInstance;

    expect(
      component.selectedStatus(),
    ).toBe('ACTIVE');

    expect(
      campaignServiceMock.getCampaignsByStatus,
    ).toHaveBeenCalledWith('ACTIVE');

    expect(
      campaignServiceMock.getCampaigns,
    ).not.toHaveBeenCalled();

    expect(
      component.campaigns(),
    ).toEqual([campaigns[0]]);

    expect(
      component.totalElements(),
    ).toBe(1);

    expect(
      component.loading(),
    ).toBe(false);

    expect(
      component.loadError(),
    ).toBe(false);
  }, 30000);

  it('should reload campaigns when status filter changes', () => {
    campaignServiceMock.getCampaignsByStatus.mockReturnValue(
      of([campaigns[1]]),
    );

    const fixture =
      TestBed.createComponent(CampaignList);

    const component =
      fixture.componentInstance;

    // Initial load uses ALL.
    expect(
      campaignServiceMock.getCampaigns,
    ).toHaveBeenCalledTimes(1);

    component.selectedStatus.set('FINISHED');

    component.onStatusChange('FINISHED');

    expect(
      campaignServiceMock.getCampaignsByStatus,
    ).toHaveBeenCalledWith('FINISHED');

    expect(
      component.campaigns(),
    ).toEqual([campaigns[1]]);

    expect(
      component.totalElements(),
    ).toBe(1);

    expect(
      component.pageIndex(),
    ).toBe(0);

    expect(
      component.loading(),
    ).toBe(false);

    expect(
      component.loadError(),
    ).toBe(false);
  }, 30000);

  it('should paginate filtered campaigns locally', () => {
    const activeCampaigns: Campaign[] = Array.from(
      { length: 15 },
      (_, index) => ({
        id: index + 1,
        name: `Active Campaign ${index + 1}`,
        description: `Campaign ${index + 1}`,
        startDate: '1984-01-01',
        status: 'ACTIVE',
      }),
    );

    activatedRouteMock.snapshot.queryParamMap.get.mockReturnValue('ACTIVE');

    campaignServiceMock.getCampaignsByStatus.mockReturnValue(
      of(activeCampaigns),
    );

    const fixture =
      TestBed.createComponent(CampaignList);

    const component =
      fixture.componentInstance;

    expect(
      component.campaigns().length,
    ).toBe(10);

    expect(
      component.totalElements(),
    ).toBe(15);

    expect(
      component.campaigns()[0].id,
    ).toBe(1);

    component.onPageChange({
      pageIndex: 1,
      pageSize: 10,
      length: 15,
    });

    expect(
      component.pageIndex(),
    ).toBe(1);

    expect(
      component.campaigns().length,
    ).toBe(5);

    expect(
      component.campaigns()[0].id,
    ).toBe(11);

    expect(
      campaignServiceMock.getCampaignsByStatus,
    ).toHaveBeenCalledTimes(1);

    expect(
      campaignServiceMock.getCampaigns,
    ).not.toHaveBeenCalled();
  }, 30000);

  it('should handle campaign loading errors', () => {
    campaignServiceMock.getCampaigns.mockReturnValue(
      throwError(() => new Error('Backend unavailable')),
    );

    const fixture =
      TestBed.createComponent(CampaignList);

    const component =
      fixture.componentInstance;

    expect(
      campaignServiceMock.getCampaigns,
    ).toHaveBeenCalledWith(
      0,
      10,
      'id',
      'asc',
    );

    expect(
      component.campaigns(),
    ).toEqual([]);

    expect(
      component.loading(),
    ).toBe(false);

    expect(
      component.loadError(),
    ).toBe(true);
  }, 30000);
});