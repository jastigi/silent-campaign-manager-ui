import { TestBed } from '@angular/core/testing';
import { ActivatedRoute, Router } from '@angular/router';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

import { of, Subject, throwError } from 'rxjs';

import { CampaignDetail } from './campaign-detail';
import { CampaignService } from '../../data-access/campaign.service';

import { CampaignDetails } from '../../models/campaign.model';
import { CampaignStatistics } from '../../models/campaign-statistics.model';

import { CampaignSimulationResult } from '../../models/campaign-simulation.model';

describe('CampaignDetail', () => {
  const campaign: CampaignDetails = {
    id: 1,
    name: 'North Atlantic Campaign',
    description: 'Cold War submarine operations.',
    startDate: '1984-01-01',
    status: 'ACTIVE',
    patrols: [],
  };

  const statistics: CampaignStatistics = {
    totalPatrols: 0,
    completedPatrols: 0,
    pendingPatrols: 0,
    completionPercentage: 0,
    completed: false,

    totalSimulations: 0,
    successfulSimulations: 0,
    partialSuccessfulSimulations: 0,
    failedSimulations: 0,

    successRate: 0,
    averageMissionScore: 0,

    totalContactsDetected: 0,
    totalContactsLost: 0,
    totalIntelligenceGathered: 0,
    totalIncidents: 0,
  };

  const emptyExecutionsPage = {
    content: [],
    totalElements: 0,
    totalPages: 0,
    size: 10,
    number: 0,
    first: true,
    last: true,
    numberOfElements: 0,
    empty: true,
  };

  const campaignServiceMock = {
    getCampaignDetails: vi.fn(),
    getCampaignStatistics: vi.fn(),
    getCampaignTimeline: vi.fn(),
    getCampaignExecutions: vi.fn(),
    deleteCampaign: vi.fn(),
    simulateCampaign: vi.fn(),
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
    TestBed.overrideComponent(CampaignDetail, {
      remove: {
        imports: [MatSnackBarModule],
      },
    });

    vi.clearAllMocks();

    activatedRouteMock.snapshot.paramMap.get.mockImplementation(
      (name: string) => {
        if (name === 'id') {
          return '1';
        }

        return null;
      },
    );

    campaignServiceMock.getCampaignDetails.mockReturnValue(
      of(campaign),
    );

    campaignServiceMock.getCampaignStatistics.mockReturnValue(
      of(statistics),
    );

    campaignServiceMock.getCampaignTimeline.mockReturnValue(
      of([]),
    );

    campaignServiceMock.getCampaignExecutions.mockReturnValue(
      of(emptyExecutionsPage),
    );

    TestBed.configureTestingModule({
      imports: [
        CampaignDetail,
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

  it('should load campaign details, statistics, timeline and executions', () => {
    const fixture =
      TestBed.createComponent(CampaignDetail);

    const component =
      fixture.componentInstance;

    expect(
      campaignServiceMock.getCampaignDetails,
    ).toHaveBeenCalledWith(1);

    expect(
      campaignServiceMock.getCampaignStatistics,
    ).toHaveBeenCalledWith(1);

    expect(
      campaignServiceMock.getCampaignTimeline,
    ).toHaveBeenCalledWith(1);

    expect(
      campaignServiceMock.getCampaignExecutions,
    ).toHaveBeenCalledWith(
      1,
      0,
      10,
    );

    expect(
      component.campaign(),
    ).toEqual(campaign);

    expect(
      component.statistics(),
    ).toEqual(statistics);

    expect(
      component.timeline(),
    ).toEqual([]);

    expect(
      component.executions(),
    ).toEqual([]);

    expect(
      component.executionsTotal(),
    ).toBe(0);

    expect(
      component.loading(),
    ).toBe(false);

    expect(
      component.loadError(),
    ).toBe(false);

    expect(
      component.statisticsLoading(),
    ).toBe(false);

    expect(
      component.statisticsError(),
    ).toBe(false);

    expect(
      component.timelineLoading(),
    ).toBe(false);

    expect(
      component.timelineError(),
    ).toBe(false);

    expect(
      component.executionsLoading(),
    ).toBe(false);

    expect(
      component.executionsError(),
    ).toBe(false);
  }, 30000);

  it('should allow editing an active campaign', () => {
    const fixture =
      TestBed.createComponent(CampaignDetail);

    const component =
      fixture.componentInstance;

    component.editCampaign();

    expect(
      routerMock.navigate,
    ).toHaveBeenCalledWith([
      '/campaigns',
      1,
      'edit',
    ]);
  }, 30000);

  it('should not allow editing a finished campaign', () => {
    campaignServiceMock.getCampaignDetails.mockReturnValue(
      of({
        ...campaign,
        status: 'FINISHED',
      }),
    );

    const fixture =
      TestBed.createComponent(CampaignDetail);

    const component =
      fixture.componentInstance;

    component.editCampaign();

    expect(
      routerMock.navigate,
    ).not.toHaveBeenCalled();
  }, 30000);

  it('should allow creating a patrol for an active campaign', () => {
    const fixture =
      TestBed.createComponent(CampaignDetail);

    const component =
      fixture.componentInstance;

    component.createPatrol();

    expect(
      routerMock.navigate,
    ).toHaveBeenCalledWith([
      '/campaigns',
      1,
      'patrols',
      'new',
    ]);
  }, 30000);

  it('should not allow creating a patrol for a finished campaign', () => {
    campaignServiceMock.getCampaignDetails.mockReturnValue(
      of({
        ...campaign,
        status: 'FINISHED',
      }),
    );

    const fixture =
      TestBed.createComponent(CampaignDetail);

    const component =
      fixture.componentInstance;

    component.createPatrol();

    expect(
      routerMock.navigate,
    ).not.toHaveBeenCalled();
  }, 30000);

  it('should delete an active campaign and navigate back to the campaign list', () => {
    const confirmSpy = vi
      .spyOn(window, 'confirm')
      .mockReturnValue(true);

    campaignServiceMock.deleteCampaign.mockReturnValue(
      of(void 0),
    );

    const fixture =
      TestBed.createComponent(CampaignDetail);

    const component =
      fixture.componentInstance;

    vi.clearAllMocks();

    campaignServiceMock.deleteCampaign.mockReturnValue(
      of(void 0),
    );

    component.deleteCampaign();

    expect(
      confirmSpy,
    ).toHaveBeenCalledTimes(1);

    expect(
      campaignServiceMock.deleteCampaign,
    ).toHaveBeenCalledWith(1);

    expect(
      component.deleting(),
    ).toBe(false);

    expect(
      snackBarMock.open,
    ).toHaveBeenCalledWith(
      'Campaign deleted successfully.',
      'Close',
      {
        duration: 4000,
      },
    );

    expect(
      routerMock.navigate,
    ).toHaveBeenCalledWith([
      '/campaigns',
    ]);

    confirmSpy.mockRestore();
  }, 30000);

  it('should not delete the campaign when confirmation is cancelled', () => {
    const confirmSpy = vi
      .spyOn(window, 'confirm')
      .mockReturnValue(false);

    const fixture =
      TestBed.createComponent(CampaignDetail);

    const component =
      fixture.componentInstance;

    vi.clearAllMocks();

    component.deleteCampaign();

    expect(
      confirmSpy,
    ).toHaveBeenCalledTimes(1);

    expect(
      campaignServiceMock.deleteCampaign,
    ).not.toHaveBeenCalled();

    expect(
      component.deleting(),
    ).toBe(false);

    expect(
      snackBarMock.open,
    ).not.toHaveBeenCalled();

    expect(
      routerMock.navigate,
    ).not.toHaveBeenCalled();

    confirmSpy.mockRestore();
  }, 30000);

  it('should not allow deleting a finished campaign', () => {
    campaignServiceMock.getCampaignDetails.mockReturnValue(
      of({
        ...campaign,
        status: 'FINISHED',
      }),
    );

    const confirmSpy = vi.spyOn(window, 'confirm');

    const fixture =
      TestBed.createComponent(CampaignDetail);

    const component =
      fixture.componentInstance;

    component.deleteCampaign();

    expect(
      confirmSpy,
    ).not.toHaveBeenCalled();

    expect(
      campaignServiceMock.deleteCampaign,
    ).not.toHaveBeenCalled();

    expect(
      component.deleting(),
    ).toBe(false);

    confirmSpy.mockRestore();
  }, 30000);

  it('should simulate an active campaign and refresh derived data', () => {
    const confirmSpy = vi
      .spyOn(window, 'confirm')
      .mockReturnValue(true);

    const simulationResult: CampaignSimulationResult = {
      campaignId: 1,
      campaignName: 'Test Campaign',
      executedAt: '2026-10-01T12:00:00',
      progress: {
        totalPatrols: 2,
        completedPatrols: 2,
        pendingPatrols: 0,
        completionPercentage: 100,
        completed: true,
      },
      patrolResults: [],
    };

    campaignServiceMock.simulateCampaign.mockReturnValue(
      of(simulationResult),
    );

    const fixture =
      TestBed.createComponent(CampaignDetail);

    const component =
      fixture.componentInstance;

    vi.clearAllMocks();

    confirmSpy.mockReturnValue(true);

    campaignServiceMock.simulateCampaign.mockReturnValue(
      of(simulationResult),
    );

    campaignServiceMock.getCampaignStatistics.mockReturnValue(
      of(statistics),
    );

    campaignServiceMock.getCampaignTimeline.mockReturnValue(
      of([]),
    );

    campaignServiceMock.getCampaignExecutions.mockReturnValue(
      of(emptyExecutionsPage),
    );

    component.runSimulation();

    expect(
      campaignServiceMock.simulateCampaign,
    ).toHaveBeenCalledWith(1);

    expect(
      component.simulating(),
    ).toBe(false);

    expect(
      component.simulationResult(),
    ).toEqual(simulationResult);

    expect(
      campaignServiceMock.getCampaignStatistics,
    ).toHaveBeenCalledWith(1);

    expect(
      campaignServiceMock.getCampaignTimeline,
    ).toHaveBeenCalledWith(1);

    expect(
      campaignServiceMock.getCampaignExecutions,
    ).toHaveBeenCalledWith(
      1,
      0,
      10,
    );

    expect(
      snackBarMock.open,
    ).toHaveBeenCalledWith(
      'Campaign simulation completed successfully.',
      'Close',
      {
        duration: 5000,
      },
    );

    confirmSpy.mockRestore();
  }, 30000);

  it('should not allow running a simulation for a finished campaign', () => {
    campaignServiceMock.getCampaignDetails.mockReturnValue(
      of({
        ...campaign,
        status: 'FINISHED',
      }),
    );

    const confirmSpy = vi.spyOn(window, 'confirm');

    const fixture =
      TestBed.createComponent(CampaignDetail);

    const component =
      fixture.componentInstance;

    component.runSimulation();

    expect(
      confirmSpy,
    ).not.toHaveBeenCalled();

    expect(
      campaignServiceMock.simulateCampaign,
    ).not.toHaveBeenCalled();

    expect(
      component.simulating(),
    ).toBe(false);

    expect(
      snackBarMock.open,
    ).not.toHaveBeenCalled();

    confirmSpy.mockRestore();
  }, 30000);

  it('should load the requested execution page', () => {
    const fixture =
      TestBed.createComponent(CampaignDetail);

    const component =
      fixture.componentInstance;

    vi.clearAllMocks();

    campaignServiceMock.getCampaignExecutions.mockReturnValue(
      of({
        content: [],
        totalElements: 25,
        totalPages: 3,
        size: 10,
        number: 2,
        first: false,
        last: true,
        numberOfElements: 5,
        empty: false,
      }),
    );

    component.onExecutionPageChange({
      pageIndex: 2,
      pageSize: 10,
      length: 25,
    });

    expect(
      component.executionsPageIndex(),
    ).toBe(2);

    expect(
      component.executionsPageSize(),
    ).toBe(10);

    expect(
      campaignServiceMock.getCampaignExecutions,
    ).toHaveBeenCalledTimes(1);

    expect(
      campaignServiceMock.getCampaignExecutions,
    ).toHaveBeenCalledWith(
      1,
      2,
      10,
    );

    expect(
      component.executionsTotal(),
    ).toBe(25);

    expect(
      component.executionsLoading(),
    ).toBe(false);

    expect(
      component.executionsError(),
    ).toBe(false);
  }, 30000);

  it('should handle a simulation error and refresh execution data', () => {
    const confirmSpy = vi
      .spyOn(window, 'confirm')
      .mockReturnValue(true);

    campaignServiceMock.simulateCampaign.mockReturnValue(
      throwError(() => ({
        error: {
          message: 'Simulation failed.',
        },
      })),
    );

    const fixture =
      TestBed.createComponent(CampaignDetail);

    const component =
      fixture.componentInstance;

    vi.clearAllMocks();

    confirmSpy.mockReturnValue(true);

    campaignServiceMock.simulateCampaign.mockReturnValue(
      throwError(() => ({
        error: {
          message: 'Simulation failed.',
        },
      })),
    );

    campaignServiceMock.getCampaignTimeline.mockReturnValue(
      of([]),
    );

    campaignServiceMock.getCampaignExecutions.mockReturnValue(
      of(emptyExecutionsPage),
    );

    component.runSimulation();

    expect(
      campaignServiceMock.simulateCampaign,
    ).toHaveBeenCalledWith(1);

    expect(
      component.simulating(),
    ).toBe(false);

    expect(
      snackBarMock.open,
    ).toHaveBeenCalledWith(
      'Simulation failed.',
      'Close',
      {
        duration: 7000,
      },
    );

    expect(
      campaignServiceMock.getCampaignTimeline,
    ).toHaveBeenCalledWith(1);

    expect(
      campaignServiceMock.getCampaignExecutions,
    ).toHaveBeenCalledWith(
      1,
      0,
      10,
    );

    expect(
      campaignServiceMock.getCampaignStatistics,
    ).not.toHaveBeenCalled();

    confirmSpy.mockRestore();
  }, 30000);

  it('should navigate back to the campaign list', () => {
    const fixture =
      TestBed.createComponent(CampaignDetail);

    const component =
      fixture.componentInstance;

    routerMock.navigate.mockClear();

    component.back();

    expect(
      routerMock.navigate,
    ).toHaveBeenCalledTimes(1);

    expect(
      routerMock.navigate,
    ).toHaveBeenCalledWith([
      '/campaigns',
    ]);
  }, 30000);

  it('should navigate to the selected patrol detail page', () => {
    const fixture =
      TestBed.createComponent(CampaignDetail);

    const component =
      fixture.componentInstance;

    const campaign = component.campaign();

    expect(campaign).not.toBeNull();

    routerMock.navigate.mockClear();

    component.openPatrol(7);

    expect(
      routerMock.navigate,
    ).toHaveBeenCalledTimes(1);

    expect(
      routerMock.navigate,
    ).toHaveBeenCalledWith([
      '/campaigns',
      campaign!.id,
      'patrols',
      7,
    ]);
  }, 30000);

  it('should not navigate to a patrol when the campaign failed to load', () => {
    campaignServiceMock.getCampaignDetails.mockReturnValue(
      throwError(() => new Error('Failed to load campaign')),
    );

    const fixture =
      TestBed.createComponent(CampaignDetail);

    const component =
      fixture.componentInstance;

    expect(
      component.campaign(),
    ).toBeNull();

    expect(
      component.loadError(),
    ).toBe(true);

    routerMock.navigate.mockClear();

    component.openPatrol(7);

    expect(
      routerMock.navigate,
    ).not.toHaveBeenCalled();
  }, 30000);

  it('should return the corresponding CSS class for each patrol result', () => {
    const fixture =
      TestBed.createComponent(CampaignDetail);

    const component =
      fixture.componentInstance;

    expect(
      component.resultClass('SUCCESS'),
    ).toBe('result-success');

    expect(
      component.resultClass('PARTIAL_SUCCESS'),
    ).toBe('result-partial-success');

    expect(
      component.resultClass('FAILURE'),
    ).toBe('result-failure');

    expect(
      component.resultClass(null),
    ).toBe('result-pending');
  }, 30000);

  it('should return the corresponding CSS class for each campaign status', () => {
    const fixture =
      TestBed.createComponent(CampaignDetail);

    const component =
      fixture.componentInstance;

    expect(
      component.statusClass('ACTIVE'),
    ).toBe('status-active');

    expect(
      component.statusClass('FINISHED'),
    ).toBe('status-finished');

    expect(
      component.statusClass('ABANDONED'),
    ).toBe('status-abandoned');
  }, 30000);

  it('should return the corresponding CSS class for each timeline event type', () => {
    const fixture =
      TestBed.createComponent(CampaignDetail);

    const component =
      fixture.componentInstance;

    expect(
      component.timelineClass('CAMPAIGN_EXECUTION_STARTED'),
    ).toBe('timeline-blue');

    expect(
      component.timelineClass('CAMPAIGN_EXECUTION_COMPLETED'),
    ).toBe('timeline-green');

    expect(
      component.timelineClass('CAMPAIGN_EXECUTION_FAILED'),
    ).toBe('timeline-red');

    expect(
      component.timelineClass('PATROL_COMPLETED'),
    ).toBe('timeline-amber');
  }, 30000);

  it('should return the corresponding CSS class for each execution status', () => {
    const fixture =
      TestBed.createComponent(CampaignDetail);

    const component =
      fixture.componentInstance;

    expect(
      component.executionStatusClass('RUNNING'),
    ).toBe('execution-running');

    expect(
      component.executionStatusClass('COMPLETED'),
    ).toBe('execution-completed');

    expect(
      component.executionStatusClass('FAILED'),
    ).toBe('execution-failed');
  }, 30000);

  it('should return the corresponding CSS class for each mission outcome', () => {
    const fixture =
      TestBed.createComponent(CampaignDetail);

    const component =
      fixture.componentInstance;

    expect(
      component.missionOutcomeClass('SUCCESS'),
    ).toBe('mission-outcome-success');

    expect(
      component.missionOutcomeClass('PARTIAL_SUCCESS'),
    ).toBe('mission-outcome-partial');

    expect(
      component.missionOutcomeClass('FAILURE'),
    ).toBe('mission-outcome-failure');

    expect(
      component.missionOutcomeClass(null),
    ).toBe('mission-outcome-neutral');
  }, 30000);

  it('should not delete when the campaign failed to load', () => {
    campaignServiceMock.getCampaignDetails.mockReturnValue(
      throwError(() => new Error('Failed to load campaign')),
    );

    const fixture =
      TestBed.createComponent(CampaignDetail);

    const component =
      fixture.componentInstance;

    expect(
      component.campaign(),
    ).toBeNull();

    expect(
      component.loadError(),
    ).toBe(true);

    const confirmSpy = vi.spyOn(window, 'confirm');

    campaignServiceMock.deleteCampaign.mockClear();

    component.deleteCampaign();

    expect(
      confirmSpy,
    ).not.toHaveBeenCalled();

    expect(
      campaignServiceMock.deleteCampaign,
    ).not.toHaveBeenCalled();

    expect(
      component.deleting(),
    ).toBe(false);

    confirmSpy.mockRestore();
  }, 30000);

  it('should prevent duplicate deletion while a deletion is in progress', () => {
    const deleteSubject = new Subject<void>();

    campaignServiceMock.deleteCampaign.mockReturnValue(
      deleteSubject.asObservable(),
    );

    const fixture =
      TestBed.createComponent(CampaignDetail);

    const component =
      fixture.componentInstance;

    const confirmSpy = vi
      .spyOn(window, 'confirm')
      .mockReturnValue(true);

    campaignServiceMock.deleteCampaign.mockClear();

    component.deleteCampaign();

    expect(
      component.deleting(),
    ).toBe(true);

    expect(
      confirmSpy,
    ).toHaveBeenCalledTimes(1);

    expect(
      campaignServiceMock.deleteCampaign,
    ).toHaveBeenCalledTimes(1);

    component.deleteCampaign();

    expect(
      confirmSpy,
    ).toHaveBeenCalledTimes(1);

    expect(
      campaignServiceMock.deleteCampaign,
    ).toHaveBeenCalledTimes(1);

    expect(
      component.deleting(),
    ).toBe(true);

    deleteSubject.next();
    deleteSubject.complete();

    expect(
      component.deleting(),
    ).toBe(false);

    confirmSpy.mockRestore();
  }, 30000);

  it('should show the backend error message when campaign deletion fails', () => {
    campaignServiceMock.deleteCampaign.mockReturnValue(
      throwError(() => ({
        error: {
          message: 'Campaign cannot be deleted.',
        },
      })),
    );

    const fixture =
      TestBed.createComponent(CampaignDetail);

    const component =
      fixture.componentInstance;

    const confirmSpy = vi
      .spyOn(window, 'confirm')
      .mockReturnValue(true);

    campaignServiceMock.deleteCampaign.mockClear();
    snackBarMock.open.mockClear();
    routerMock.navigate.mockClear();

    component.deleteCampaign();

    expect(
      confirmSpy,
    ).toHaveBeenCalledTimes(1);

    expect(
      campaignServiceMock.deleteCampaign,
    ).toHaveBeenCalledTimes(1);

    expect(
      component.deleting(),
    ).toBe(false);

    expect(
      snackBarMock.open,
    ).toHaveBeenCalledWith(
      'Campaign cannot be deleted.',
      'Close',
      {
        duration: 6000,
      },
    );

    expect(
      routerMock.navigate,
    ).not.toHaveBeenCalled();

    confirmSpy.mockRestore();
  }, 30000);

  it('should show the fallback message when campaign deletion fails without a backend message', () => {
    campaignServiceMock.deleteCampaign.mockReturnValue(
      throwError(() => new Error('Network error')),
    );

    const fixture =
      TestBed.createComponent(CampaignDetail);

    const component =
      fixture.componentInstance;

    const confirmSpy = vi
      .spyOn(window, 'confirm')
      .mockReturnValue(true);

    campaignServiceMock.deleteCampaign.mockClear();
    snackBarMock.open.mockClear();
    routerMock.navigate.mockClear();

    component.deleteCampaign();

    expect(
      confirmSpy,
    ).toHaveBeenCalledTimes(1);

    expect(
      campaignServiceMock.deleteCampaign,
    ).toHaveBeenCalledTimes(1);

    expect(
      component.deleting(),
    ).toBe(false);

    expect(
      snackBarMock.open,
    ).toHaveBeenCalledWith(
      'Unable to delete campaign.',
      'Close',
      {
        duration: 6000,
      },
    );

    expect(
      routerMock.navigate,
    ).not.toHaveBeenCalled();

    confirmSpy.mockRestore();
  }, 30000);

  it('should show the campaign load error while keeping the other sections loaded', () => {
    campaignServiceMock.getCampaignDetails.mockReturnValue(
      throwError(() => new Error('Failed to load campaign')),
    );

    const fixture =
      TestBed.createComponent(CampaignDetail);

    const component =
      fixture.componentInstance;

    expect(
      component.loading(),
    ).toBe(false);

    expect(
      component.loadError(),
    ).toBe(true);

    expect(
      component.campaign(),
    ).toBeNull();

    expect(
      campaignServiceMock.getCampaignStatistics,
    ).toHaveBeenCalledWith(1);

    expect(
      component.statisticsError(),
    ).toBe(false);

    expect(
      component.statisticsLoading(),
    ).toBe(false);

    expect(
      component.statistics(),
    ).not.toBeNull();

    expect(
      campaignServiceMock.getCampaignTimeline,
    ).toHaveBeenCalledWith(1);

    expect(
      component.timelineError(),
    ).toBe(false);

    expect(
      component.timelineLoading(),
    ).toBe(false);

    expect(
      campaignServiceMock.getCampaignExecutions,
    ).toHaveBeenCalledWith(
      1,
      0,
      10,
    );

    expect(
      component.executionsError(),
    ).toBe(false);

    expect(
      component.executionsLoading(),
    ).toBe(false);
  }, 30000);

  it('should show the statistics load error while keeping the campaign loaded', () => {
    campaignServiceMock.getCampaignStatistics.mockReturnValue(
      throwError(() => new Error('Failed to load statistics')),
    );

    const fixture =
      TestBed.createComponent(CampaignDetail);

    const component =
      fixture.componentInstance;

    expect(
      component.statisticsLoading(),
    ).toBe(false);

    expect(
      component.statisticsError(),
    ).toBe(true);

    expect(
      component.statistics(),
    ).toBeNull();

    expect(
      component.loadError(),
    ).toBe(false);

    expect(
      component.campaign(),
    ).not.toBeNull();
  }, 30000);

  it('should show the timeline load error when loading the timeline fails', () => {
    campaignServiceMock.getCampaignTimeline.mockReturnValue(
      throwError(() => new Error('Failed to load timeline')),
    );

    const fixture =
      TestBed.createComponent(CampaignDetail);

    const component =
      fixture.componentInstance;

    expect(
      component.timelineLoading(),
    ).toBe(false);

    expect(
      component.timelineError(),
    ).toBe(true);

    expect(
      component.loadError(),
    ).toBe(false);

    expect(
      component.campaign(),
    ).not.toBeNull();
  }, 30000);
});