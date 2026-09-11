import { TestBed } from '@angular/core/testing';
import { ActivatedRoute, Router } from '@angular/router';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

import { of, throwError } from 'rxjs';

import { PatrolDetail } from './patrol-detail';

import { PatrolService } from '../../data-access/patrol.service';

import {
  MissionEvaluation,
  PatrolReport,
} from '../../models/patrol.model';

describe('PatrolDetail', () => {
  const report: PatrolReport = {
    patrolId: 10,
    patrolName: 'North Atlantic Patrol',
    campaignId: 1,
    campaignName: 'North Atlantic Campaign',
    submarineId: 5,
    submarineName: 'USS Ohio',
    submarineClass: 'OHIO',
    contactsDetected: 0,
    submarineContacts: 0,
    surfaceContacts: 0,
    aircraftContacts: 0,
    unknownContacts: 0,
    detectedContacts: 0,
    criticalContacts: 0,
    highThreatContacts: 0,
    averageConfidence: 0,
    eventsRecorded: 0,
    criticalEvents: 0,
    riskScore: 0,
    missionStatus: null,
  };

  const evaluation: MissionEvaluation = {
    success: true,
    patrolResult: 'SUCCESS',
    score: 100,
    summary: 'Mission completed successfully.',
  };

  const patrolServiceMock = {
    getPatrolReport: vi.fn(),
    getPatrolContacts: vi.fn(),
    getMissionEvaluation: vi.fn(),
    getSimulationHistory: vi.fn(),
    closePatrol: vi.fn(),
    deletePatrol: vi.fn(),
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
        get: vi.fn((name: string): string | null => {
          if (name === 'campaignId') {
            return '1';
          }

          if (name === 'patrolId') {
            return '10';
          }

          return null;
        }),
      },
    },
  };

  beforeEach(() => {
    vi.resetAllMocks();

    activatedRouteMock.snapshot.paramMap.get.mockImplementation(
      (name: string): string | null => {
        if (name === 'campaignId') {
          return '1';
        }

        if (name === 'patrolId') {
          return '10';
        }

        return null;
      },
    );

    patrolServiceMock.getPatrolReport.mockReturnValue(
      of(report),
    );

    patrolServiceMock.getPatrolContacts.mockReturnValue(
      of([]),
    );

    patrolServiceMock.getMissionEvaluation.mockReturnValue(
      of(evaluation),
    );

    patrolServiceMock.getSimulationHistory.mockReturnValue(
      of({
        content: [],
        totalElements: 0,
        totalPages: 0,
        size: 5,
        number: 0,
        first: true,
        last: true,
        numberOfElements: 0,
        empty: true,
      }),
    );

    TestBed.overrideComponent(PatrolDetail, {
      remove: {
        imports: [
          MatSnackBarModule,
        ],
      },
    });

    TestBed.configureTestingModule({
      imports: [
        PatrolDetail,
      ],
      providers: [
        {
          provide: PatrolService,
          useValue: patrolServiceMock,
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

  it('should load patrol details and simulation history', () => {
    const fixture =
      TestBed.createComponent(PatrolDetail);

    const component =
      fixture.componentInstance;

    expect(
      patrolServiceMock.getPatrolReport,
    ).toHaveBeenCalledWith(1, 10);

    expect(
      patrolServiceMock.getPatrolContacts,
    ).toHaveBeenCalledWith(1, 10);

    expect(
      patrolServiceMock.getMissionEvaluation,
    ).toHaveBeenCalledWith(1, 10);

    expect(
      patrolServiceMock.getSimulationHistory,
    ).toHaveBeenCalledWith(
      10,
      0,
      5,
    );

    expect(
      component.report(),
    ).toEqual(report);

    expect(
      component.contacts(),
    ).toEqual([]);

    expect(
      component.evaluation(),
    ).toEqual(evaluation);

    expect(
      component.loading(),
    ).toBe(false);

    expect(
      component.loadError(),
    ).toBe(false);

    expect(
      component.simulationHistory(),
    ).toEqual([]);

    expect(
      component.simulationHistoryTotal(),
    ).toBe(0);

    expect(
      component.simulationHistoryLoading(),
    ).toBe(false);

    expect(
      component.simulationHistoryError(),
    ).toBe(false);
  }, 30000);

  it('should reject invalid route parameters without calling the backend', () => {
    activatedRouteMock.snapshot.paramMap.get.mockImplementation(
      (name: string) => {
        if (name === 'campaignId') {
          return 'invalid';
        }

        if (name === 'patrolId') {
          return '10';
        }

        return null;
      },
    );

    const fixture =
      TestBed.createComponent(PatrolDetail);

    const component =
      fixture.componentInstance;

    expect(
      patrolServiceMock.getPatrolReport,
    ).not.toHaveBeenCalled();

    expect(
      patrolServiceMock.getPatrolContacts,
    ).not.toHaveBeenCalled();

    expect(
      patrolServiceMock.getMissionEvaluation,
    ).not.toHaveBeenCalled();

    expect(
      patrolServiceMock.getSimulationHistory,
    ).not.toHaveBeenCalled();

    expect(
      component.loading(),
    ).toBe(false);

    expect(
      component.loadError(),
    ).toBe(true);
  }, 30000);

  it('should allow editing a pending patrol', () => {
    const fixture =
      TestBed.createComponent(PatrolDetail);

    const component =
      fixture.componentInstance;

    component.editPatrol();

    expect(
      routerMock.navigate,
    ).toHaveBeenCalledWith([
      '/campaigns',
      1,
      'patrols',
      10,
      'edit',
    ]);
  }, 30000);

  it('should not allow editing a closed patrol', () => {
    patrolServiceMock.getPatrolReport.mockReturnValue(
      of({
        ...report,
        missionStatus: 'SUCCESS',
      }),
    );

    const fixture =
      TestBed.createComponent(PatrolDetail);

    const component =
      fixture.componentInstance;

    component.editPatrol();

    expect(
      routerMock.navigate,
    ).not.toHaveBeenCalled();
  }, 30000);

  it('should close a pending patrol and reload its details', () => {
    const confirmSpy = vi
      .spyOn(window, 'confirm')
      .mockReturnValue(true);

    const fixture =
      TestBed.createComponent(PatrolDetail);

    const component =
      fixture.componentInstance;

    vi.clearAllMocks();

    patrolServiceMock.closePatrol.mockReturnValue(
      of({
        id: 10,
        result: 'SUCCESS',
      }),
    );

    patrolServiceMock.getPatrolReport.mockReturnValue(
      of(report),
    );

    patrolServiceMock.getPatrolContacts.mockReturnValue(
      of([]),
    );

    patrolServiceMock.getMissionEvaluation.mockReturnValue(
      of(evaluation),
    );

    patrolServiceMock.getSimulationHistory.mockReturnValue(
      of({
        content: [],
        totalElements: 0,
        totalPages: 0,
        size: 5,
        number: 0,
        first: true,
        last: true,
        numberOfElements: 0,
        empty: true,
      }),
    );

    component.closePatrol();

    expect(
      confirmSpy,
    ).toHaveBeenCalledTimes(1);

    expect(
      patrolServiceMock.closePatrol,
    ).toHaveBeenCalledWith(1, 10);

    expect(
      component.closing(),
    ).toBe(false);

    expect(
      snackBarMock.open,
    ).toHaveBeenCalledWith(
      'Patrol closed: SUCCESS.',
      'Close',
      {
        duration: 5000,
      },
    );

    expect(
      patrolServiceMock.getPatrolReport,
    ).toHaveBeenCalledWith(1, 10);

    expect(
      patrolServiceMock.getSimulationHistory,
    ).toHaveBeenCalledWith(
      10,
      0,
      5,
    );

    confirmSpy.mockRestore();
  }, 30000);

  it('should not close the patrol when confirmation is cancelled', () => {
    const confirmSpy = vi
      .spyOn(window, 'confirm')
      .mockReturnValue(false);

    const fixture =
      TestBed.createComponent(PatrolDetail);

    const component =
      fixture.componentInstance;

    vi.clearAllMocks();

    component.closePatrol();

    expect(
      confirmSpy,
    ).toHaveBeenCalledTimes(1);

    expect(
      patrolServiceMock.closePatrol,
    ).not.toHaveBeenCalled();

    expect(
      component.closing(),
    ).toBe(false);

    expect(
      snackBarMock.open,
    ).not.toHaveBeenCalled();

    confirmSpy.mockRestore();
  }, 30000);

  it('should handle an error when closing a patrol', () => {
    const confirmSpy = vi
      .spyOn(window, 'confirm')
      .mockReturnValue(true);

    patrolServiceMock.closePatrol.mockReturnValue(
      throwError(() => ({
        error: {
          message: 'Unable to close this patrol.',
        },
      })),
    );

    const fixture =
      TestBed.createComponent(PatrolDetail);

    const component =
      fixture.componentInstance;

    vi.clearAllMocks();

    patrolServiceMock.closePatrol.mockReturnValue(
      throwError(() => ({
        error: {
          message: 'Unable to close this patrol.',
        },
      })),
    );

    component.closePatrol();

    expect(
      patrolServiceMock.closePatrol,
    ).toHaveBeenCalledWith(1, 10);

    expect(
      component.closing(),
    ).toBe(false);

    expect(
      snackBarMock.open,
    ).toHaveBeenCalledWith(
      'Unable to close this patrol.',
      'Close',
      {
        duration: 6000,
      },
    );

    expect(
      patrolServiceMock.getPatrolReport,
    ).not.toHaveBeenCalled();

    expect(
      patrolServiceMock.getSimulationHistory,
    ).not.toHaveBeenCalled();

    confirmSpy.mockRestore();
  }, 30000);

  it('should load the requested simulation history page', () => {
    const fixture =
      TestBed.createComponent(PatrolDetail);

    const component =
      fixture.componentInstance;

    vi.clearAllMocks();

    patrolServiceMock.getSimulationHistory.mockReturnValue(
      of({
        content: [],
        totalElements: 12,
        totalPages: 2,
        size: 10,
        number: 1,
        first: false,
        last: true,
        numberOfElements: 2,
        empty: false,
      }),
    );

    component.onSimulationHistoryPageChange({
      pageIndex: 1,
      pageSize: 10,
      length: 12,
    });

    expect(
      component.simulationHistoryPageIndex(),
    ).toBe(1);

    expect(
      component.simulationHistoryPageSize(),
    ).toBe(10);

    expect(
      patrolServiceMock.getSimulationHistory,
    ).toHaveBeenCalledTimes(1);

    expect(
      patrolServiceMock.getSimulationHistory,
    ).toHaveBeenCalledWith(
      10,
      1,
      10,
    );

    expect(
      component.simulationHistoryTotal(),
    ).toBe(12);

    expect(
      component.simulationHistoryLoading(),
    ).toBe(false);

    expect(
      component.simulationHistoryError(),
    ).toBe(false);
  }, 30000);

  it('should delete a pending patrol and navigate back to the campaign', () => {
    const confirmSpy = vi
      .spyOn(window, 'confirm')
      .mockReturnValue(true);

    const fixture =
      TestBed.createComponent(PatrolDetail);

    const component =
      fixture.componentInstance;

    vi.clearAllMocks();

    patrolServiceMock.deletePatrol.mockReturnValue(
      of(void 0),
    );

    component.deletePatrol();

    expect(
      confirmSpy,
    ).toHaveBeenCalledTimes(1);

    expect(
      patrolServiceMock.deletePatrol,
    ).toHaveBeenCalledWith(1, 10);

    expect(
      component.deleting(),
    ).toBe(false);

    expect(
      snackBarMock.open,
    ).toHaveBeenCalledWith(
      'Patrol deleted successfully.',
      'Close',
      {
        duration: 4000,
      },
    );

    expect(
      routerMock.navigate,
    ).toHaveBeenCalledWith([
      '/campaigns',
      1,
    ]);

    confirmSpy.mockRestore();
  }, 30000);

  it('should not delete the patrol when confirmation is cancelled', () => {
    const confirmSpy = vi
      .spyOn(window, 'confirm')
      .mockReturnValue(false);

    const fixture =
      TestBed.createComponent(PatrolDetail);

    const component =
      fixture.componentInstance;

    vi.clearAllMocks();

    component.deletePatrol();

    expect(
      confirmSpy,
    ).toHaveBeenCalledTimes(1);

    expect(
      patrolServiceMock.deletePatrol,
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
});
