import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { Subject, of, throwError } from 'rxjs';

import { SimulationHistory } from './simulation-history';
import { SimulationHistoryService } from '../../data-access/simulation-history.service';
import { SimulationHistoryRecord } from '../../models/simulation-history.model';
import { PatrolService } from '../../../patrols/data-access/patrol.service';
import { Patrol } from '../../../patrols/models/patrol.model';

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

  it('should report an error when simulation history fails to load', () => {
    simulationHistoryServiceMock.getHistory.mockReturnValue(
      throwError(() => new Error('Unable to load simulation history')),
    );

    const fixture = TestBed.createComponent(SimulationHistory);
    const component = fixture.componentInstance;

    expect(simulationHistoryServiceMock.getHistory).toHaveBeenCalledWith(
      0,
      10,
    );

    expect(
      simulationHistoryServiceMock.getHistoryByPatrol,
    ).not.toHaveBeenCalled();

    expect(component.simulations()).toEqual([]);
    expect(component.totalElements()).toBe(0);

    expect(component.loading()).toBe(false);
    expect(component.loadError()).toBe(true);
  }, 30000);

  it('should load simulation history filtered by patrol', () => {
    simulationHistoryServiceMock.getHistoryByPatrol.mockReturnValue(
      of({
        content: [simulation],
        totalElements: 1,
        totalPages: 1,
        size: 10,
        number: 0,
        first: true,
        last: true,
        numberOfElements: 1,
        empty: false,
      }),
    );

    const fixture = TestBed.createComponent(SimulationHistory);
    const component = fixture.componentInstance;

    vi.clearAllMocks();

    component.patrolFilter.set('10');

    component.applyPatrolFilter();

    expect(
      simulationHistoryServiceMock.getHistoryByPatrol,
    ).toHaveBeenCalledWith(10, 0, 10);

    expect(simulationHistoryServiceMock.getHistory).not.toHaveBeenCalled();

    expect(component.simulations()).toEqual([simulation]);
    expect(component.totalElements()).toBe(1);
    expect(component.loading()).toBe(false);
    expect(component.loadError()).toBe(false);
  }, 30000);

  it('should clear patrol filter and reload global simulation history', () => {
    simulationHistoryServiceMock.getHistoryByPatrol.mockReturnValue(
      of({
        content: [simulation],
        totalElements: 1,
        totalPages: 1,
        size: 10,
        number: 0,
        first: true,
        last: true,
        numberOfElements: 1,
        empty: false,
      }),
    );

    const fixture = TestBed.createComponent(SimulationHistory);
    const component = fixture.componentInstance;

    component.patrolFilter.set('10');
    component.applyPatrolFilter();

    expect(component.activePatrolId()).toBe(10);

    vi.clearAllMocks();

    component.patrolFilter.set('');
    component.applyPatrolFilter();

    expect(component.activePatrolId()).toBeNull();
    expect(component.pageIndex()).toBe(0);
    expect(component.expandedSimulationId()).toBeNull();

    expect(simulationHistoryServiceMock.getHistory).toHaveBeenCalledWith(
      0,
      10,
    );

    expect(
      simulationHistoryServiceMock.getHistoryByPatrol,
    ).not.toHaveBeenCalled();

    expect(component.simulations()).toEqual([simulation]);
    expect(component.totalElements()).toBe(12);
    expect(component.loading()).toBe(false);
    expect(component.loadError()).toBe(false);
  }, 30000);

  it('should update pagination and reload simulation history', () => {
    const fixture = TestBed.createComponent(SimulationHistory);
    const component = fixture.componentInstance;

    vi.clearAllMocks();

    component.onPageChange({
      pageIndex: 2,
      previousPageIndex: 1,
      pageSize: 25,
      length: 50,
    });

    expect(component.pageIndex()).toBe(2);
    expect(component.pageSize()).toBe(25);

    expect(
      simulationHistoryServiceMock.getHistory,
    ).toHaveBeenCalledWith(2, 25);

    expect(
      simulationHistoryServiceMock.getHistoryByPatrol,
    ).not.toHaveBeenCalled();
  }, 30000);

  it('should reject an invalid patrol filter', () => {
    const fixture = TestBed.createComponent(SimulationHistory);
    const component = fixture.componentInstance;

    vi.clearAllMocks();

    component.patrolFilter.set('invalid');
    component.applyPatrolFilter();

    expect(component.activePatrolId()).toBeNull();

    expect(
      simulationHistoryServiceMock.getHistory,
    ).not.toHaveBeenCalled();

    expect(
      simulationHistoryServiceMock.getHistoryByPatrol,
    ).not.toHaveBeenCalled();

    expect(snackBarMock.open).toHaveBeenCalledWith(
      'Enter a valid Patrol ID.',
      'Close',
      {
        duration: 4000,
      },
    );
  }, 30000);

  it('should recover from a load error when refreshing', () => {
    simulationHistoryServiceMock.getHistory.mockReturnValueOnce(
      throwError(() => new Error('Unable to load simulation history')),
    );

    const fixture = TestBed.createComponent(SimulationHistory);
    const component = fixture.componentInstance;

    expect(component.loadError()).toBe(true);
    expect(component.loading()).toBe(false);

    vi.clearAllMocks();

    component.refresh();

    expect(simulationHistoryServiceMock.getHistory).toHaveBeenCalledWith(
      0,
      10,
    );

    expect(
      simulationHistoryServiceMock.getHistoryByPatrol,
    ).not.toHaveBeenCalled();

    expect(component.simulations()).toEqual([simulation]);
    expect(component.totalElements()).toBe(12);
    expect(component.loading()).toBe(false);
    expect(component.loadError()).toBe(false);
  }, 30000);

  it('should toggle simulation details expansion', () => {
    const stopPropagation = vi.fn();

    const event = {
      stopPropagation,
    } as unknown as MouseEvent;

    const fixture = TestBed.createComponent(SimulationHistory);
    const component = fixture.componentInstance;

    expect(component.expandedSimulationId()).toBeNull();

    component.toggleDetails(simulation.id, event);

    expect(component.expandedSimulationId()).toBe(simulation.id);
    expect(stopPropagation).toHaveBeenCalled();

    component.toggleDetails(simulation.id, event);

    expect(component.expandedSimulationId()).toBeNull();
  }, 30000);

  it('should open the patrol associated with a simulation', () => {
    patrolServiceMock.getPatrol.mockReturnValue(
      of({
        id: 10,
        campaignId: 5,
        patrolName: 'North Atlantic Patrol',
        patrolDate: '2026-09-01',
        area: null,
        result: null,
        submarineId: 3,
        submarineName: 'USS Example',
        missionType: 'DETERRENCE_PATROL',
        detectedContacts: null,
      }),
    );

    const fixture = TestBed.createComponent(SimulationHistory);
    const component = fixture.componentInstance;

    vi.clearAllMocks();

    component.openPatrol(simulation);

    expect(patrolServiceMock.getPatrol).toHaveBeenCalledWith(
      simulation.patrolId,
    );

    expect(routerMock.navigate).toHaveBeenCalledWith([
      '/campaigns',
      5,
      'patrols',
      10,
    ]);

    expect(component.openingPatrol()).toBeNull();
  }, 30000);

  it('should show an error when the patrol cannot be opened', () => {
    patrolServiceMock.getPatrol.mockReturnValue(
      throwError(() => new Error('Unable to load patrol')),
    );

    const fixture = TestBed.createComponent(SimulationHistory);
    const component = fixture.componentInstance;

    vi.clearAllMocks();

    component.openPatrol(simulation);

    expect(patrolServiceMock.getPatrol).toHaveBeenCalledWith(
      simulation.patrolId,
    );

    expect(routerMock.navigate).not.toHaveBeenCalled();

    expect(snackBarMock.open).toHaveBeenCalledWith(
      'Unable to open patrol.',
      'Close',
      {
        duration: 5000,
      },
    );

    expect(component.openingPatrol()).toBeNull();
  }, 30000);

  it('should prevent reopening a patrol while the request is pending', () => {
    const patrolSubject = new Subject<Patrol>();

    const patrol: Patrol = {
      id: 10,
      campaignId: 5,
      submarineId: 3,
      submarineName: 'USS Example',
      patrolName: 'North Atlantic Patrol',
      patrolDate: '2026-09-01',
      area: 'North Atlantic',
      missionType: 'DETERRENCE_PATROL',
      detectedContacts: 3,
      result: null,
    };

    patrolServiceMock.getPatrol.mockReturnValue(
      patrolSubject.asObservable(),
    );

    const fixture = TestBed.createComponent(SimulationHistory);
    const component = fixture.componentInstance;

    vi.clearAllMocks();

    component.openPatrol(simulation);

    expect(patrolServiceMock.getPatrol).toHaveBeenCalledTimes(1);
    expect(patrolServiceMock.getPatrol).toHaveBeenCalledWith(
      simulation.patrolId,
    );
    expect(component.openingPatrol()).toBe(simulation.patrolId);

    component.openPatrol(simulation);

    expect(patrolServiceMock.getPatrol).toHaveBeenCalledTimes(1);
    expect(routerMock.navigate).not.toHaveBeenCalled();

    patrolSubject.next(patrol);

    expect(component.openingPatrol()).toBeNull();

    expect(routerMock.navigate).toHaveBeenCalledWith([
      '/campaigns',
      patrol.campaignId,
      'patrols',
      patrol.id,
    ]);
  }, 30000);

  it('should return the CSS class for a simulation outcome', () => {
    const fixture = TestBed.createComponent(SimulationHistory);
    const component = fixture.componentInstance;

    expect(
      component.simulationOutcomeClass('SUCCESS'),
    ).toBe('simulation-outcome-success');

    expect(
      component.simulationOutcomeClass('PARTIAL_SUCCESS'),
    ).toBe('simulation-outcome-partial-success');

    expect(
      component.simulationOutcomeClass('FAILURE'),
    ).toBe('simulation-outcome-failure');
  }, 30000);

  it('should return the CSS class for a simulation state', () => {
    const fixture = TestBed.createComponent(SimulationHistory);
    const component = fixture.componentInstance;

    expect(
      component.simulationStateClass('NOT_STARTED'),
    ).toBe('simulation-state-not-started');

    expect(
      component.simulationStateClass('ON_PATROL'),
    ).toBe('simulation-state-on-patrol');

    expect(
      component.simulationStateClass('COMPLETED'),
    ).toBe('simulation-state-completed');
  }, 30000);

  it('should format simulation values by replacing underscores with spaces', () => {
    const fixture = TestBed.createComponent(SimulationHistory);
    const component = fixture.componentInstance;

    expect(component.formatValue('ON_PATROL')).toBe('ON PATROL');

    expect(component.formatValue('NOT_STARTED')).toBe('NOT STARTED');

    expect(component.formatValue('SUCCESS')).toBe('SUCCESS');
  }, 30000);
});
