import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { of } from 'rxjs';

import { SimulationHistory } from './simulation-history';
import { SimulationHistoryService } from '../../data-access/simulation-history.service';
import { SimulationHistoryRecord } from '../../models/simulation-history.model';
import { PatrolService } from '../../../patrols/data-access/patrol.service';

describe('SimulationHistory', () => {
  const simulationHistoryServiceMock = {
    getHistory: vi.fn(),
    getHistoryByPatrol: vi.fn(),
  };

  const patrolServiceMock = {
    getPatrol: vi.fn(),
  };

  const routerMock = {
    navigate: vi.fn(),
  };

  const snackBarMock = {
    open: vi.fn(),
  };

  const simulation: SimulationHistoryRecord = {
    id: 101,
    patrolId: 10,
    patrolName: 'North Atlantic Patrol',
    missionOutcome: 'SUCCESS',
    missionScore: 85,
    finalState: 'COMPLETED',
    contactsDetected: 3,
    contactsLost: 1,
    intelligenceGathered: 2,
    incidents: 0,
    completionDate: '2026-09-20',
    recordedAt: '2026-09-20T12:00:00',
    reportSummary: 'Mission completed.',
    missionDebrief: 'Successful patrol.',
  };

  beforeEach(() => {
    vi.clearAllMocks();

    simulationHistoryServiceMock.getHistory.mockReturnValue(
      of({
        content: [simulation],
        totalElements: 12,
        totalPages: 2,
        size: 10,
        number: 0,
        first: true,
        last: false,
        numberOfElements: 1,
        empty: false,
      }),
    );

    TestBed.overrideComponent(SimulationHistory, {
      remove: {
        imports: [MatSnackBarModule],
      },
    });

    TestBed.configureTestingModule({
      imports: [SimulationHistory],
      providers: [
        {
          provide: SimulationHistoryService,
          useValue: simulationHistoryServiceMock,
        },
        {
          provide: PatrolService,
          useValue: patrolServiceMock,
        },
        {
          provide: Router,
          useValue: routerMock,
        },
        {
          provide: MatSnackBar,
          useValue: snackBarMock,
        },
      ],
    });
  });

  it('should load simulation history on creation', () => {
    const fixture = TestBed.createComponent(SimulationHistory);
    const component = fixture.componentInstance;

    expect(simulationHistoryServiceMock.getHistory).toHaveBeenCalledWith(
      0,
      10,
    );

    expect(
      simulationHistoryServiceMock.getHistoryByPatrol,
    ).not.toHaveBeenCalled();

    expect(component.simulations()).toEqual([simulation]);
    expect(component.totalElements()).toBe(12);
    expect(component.pageIndex()).toBe(0);
    expect(component.pageSize()).toBe(10);

    expect(component.loading()).toBe(false);
    expect(component.loadError()).toBe(false);
  }, 30000);
});
