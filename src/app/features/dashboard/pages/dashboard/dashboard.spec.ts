import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { of, throwError, Observable } from 'rxjs';

import { Dashboard } from './dashboard';

import { CampaignService } from '../../../campaigns/data-access/campaign.service';
import { SubmarineService } from '../../../submarines/data-access/submarine.service';
import { SimulationHistoryService } from '../../../simulations/data-access/simulation-history.service';
import { PatrolService } from '../../../patrols/data-access/patrol.service';
import { Patrol } from '../../../patrols/models/patrol.model';

describe('Dashboard', () => {
  const campaignServiceMock = {
    getCampaigns: vi.fn(),
    getCampaignsByStatus: vi.fn(),
  };

  const submarineServiceMock = {
    getSubmarines: vi.fn(),
  };

  const simulationHistoryServiceMock = {
    getHistory: vi.fn(),
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

  beforeEach(() => {
    vi.clearAllMocks();

    campaignServiceMock.getCampaigns.mockReturnValue(
      of({
        content: [],
        totalElements: 6,
        totalPages: 6,
        size: 1,
        number: 0,
        first: true,
        last: false,
        numberOfElements: 1,
        empty: false,
      }),
    );

    campaignServiceMock.getCampaignsByStatus.mockImplementation(
      (status: string) => {
        switch (status) {
          case 'ACTIVE':
            return of([{ id: 1 }, { id: 2 }, { id: 3 }]);

          case 'FINISHED':
            return of([{ id: 4 }, { id: 5 }]);

          case 'ABANDONED':
            return of([{ id: 6 }]);

          default:
            return of([]);
        }
      },
    );

    submarineServiceMock.getSubmarines.mockReturnValue(
      of([
        { id: 1, status: 'ACTIVE' },
        { id: 2, status: 'ACTIVE' },
        { id: 3, status: 'REFIT' },
        { id: 4, status: 'DAMAGED' },
        { id: 5, status: 'RETIRED' },
      ]),
    );

    simulationHistoryServiceMock.getHistory.mockReturnValue(
      of({
        content: [
          {
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
          },
        ],
        totalElements: 12,
        totalPages: 3,
        size: 5,
        number: 0,
        first: true,
        last: false,
        numberOfElements: 1,
        empty: false,
      }),
    );

    TestBed.overrideComponent(Dashboard, {
      remove: {
        imports: [MatSnackBarModule],
      },
    });

    TestBed.configureTestingModule({
      imports: [Dashboard],
      providers: [
        {
          provide: CampaignService,
          useValue: campaignServiceMock,
        },
        {
          provide: SubmarineService,
          useValue: submarineServiceMock,
        },
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

  it('should load dashboard data', () => {
    const fixture = TestBed.createComponent(Dashboard);
    const component = fixture.componentInstance;

    component.ngOnInit();

    expect(campaignServiceMock.getCampaigns).toHaveBeenCalledWith(
      0,
      1,
      'id',
      'asc',
    );

    expect(campaignServiceMock.getCampaignsByStatus).toHaveBeenCalledWith(
      'ACTIVE',
    );
    expect(campaignServiceMock.getCampaignsByStatus).toHaveBeenCalledWith(
      'FINISHED',
    );
    expect(campaignServiceMock.getCampaignsByStatus).toHaveBeenCalledWith(
      'ABANDONED',
    );

    expect(submarineServiceMock.getSubmarines).toHaveBeenCalled();
    expect(simulationHistoryServiceMock.getHistory).toHaveBeenCalledWith(
      0,
      5,
    );

    expect(component.totalCampaigns()).toBe(6);
    expect(component.activeCampaigns()).toBe(3);
    expect(component.finishedCampaigns()).toBe(2);
    expect(component.abandonedCampaigns()).toBe(1);

    expect(component.totalSubmarines()).toBe(5);
    expect(component.activeSubmarines()).toBe(2);
    expect(component.refitSubmarines()).toBe(1);
    expect(component.damagedSubmarines()).toBe(1);
    expect(component.retiredSubmarines()).toBe(1);

    expect(component.totalSimulations()).toBe(12);
    expect(component.recentSimulations()).toHaveLength(1);

    expect(component.loading()).toBe(false);
    expect(component.loadError()).toBe(false);
  }, 30000);

  it('should report an error when dashboard data fails to load', () => {
    campaignServiceMock.getCampaigns.mockReturnValue(
      throwError(() => new Error('Unable to load campaigns')),
    );

    const fixture = TestBed.createComponent(Dashboard);
    const component = fixture.componentInstance;

    component.ngOnInit();

    expect(campaignServiceMock.getCampaigns).toHaveBeenCalledWith(
      0,
      1,
      'id',
      'asc',
    );

    expect(component.loading()).toBe(false);
    expect(component.loadError()).toBe(true);
  }, 30000);

  it('should navigate to active campaigns', () => {
    const stopPropagation = vi.fn();

    const event = {
      stopPropagation,
    } as unknown as Event;

    const fixture = TestBed.createComponent(Dashboard);
    const component = fixture.componentInstance;

    component.ngOnInit();

    component.openCampaignsByStatus('ACTIVE', event);

    expect(stopPropagation).toHaveBeenCalled();

    expect(routerMock.navigate).toHaveBeenCalledWith(
      ['/campaigns'],
      {
        queryParams: {
          status: 'ACTIVE',
        },
      },
    );
  }, 30000);

  it('should navigate to submarines filtered by status', () => {
    const stopPropagation = vi.fn();

    const event = {
      stopPropagation,
    } as unknown as Event;

    const fixture = TestBed.createComponent(Dashboard);
    const component = fixture.componentInstance;

    component.ngOnInit();

    component.openSubmarinesByStatus('REFIT', event);

    expect(stopPropagation).toHaveBeenCalled();

    expect(routerMock.navigate).toHaveBeenCalledWith(
      ['/submarines'],
      {
        queryParams: {
          status: 'REFIT',
        },
      },
    );
  }, 30000);

  it('should open the patrol for a recent simulation', () => {
    patrolServiceMock.getPatrol.mockReturnValue(
      of({
        id: 10,
        campaignId: 3,
      }),
    );

    const fixture = TestBed.createComponent(Dashboard);
    const component = fixture.componentInstance;

    component.ngOnInit();

    const simulation = component.recentSimulations()[0];

    component.openSimulationPatrol(simulation);

    expect(patrolServiceMock.getPatrol).toHaveBeenCalledWith(10);

    expect(routerMock.navigate).toHaveBeenCalledWith([
      '/campaigns',
      3,
      'patrols',
      10,
    ]);

    expect(snackBarMock.open).not.toHaveBeenCalled();
  }, 30000);

  it('should show an error when patrol cannot be opened', () => {
    patrolServiceMock.getPatrol.mockReturnValue(
      throwError(() => new Error('Unable to load patrol')),
    );

    const fixture = TestBed.createComponent(Dashboard);
    const component = fixture.componentInstance;

    component.ngOnInit();

    const simulation = component.recentSimulations()[0];

    component.openSimulationPatrol(simulation);

    expect(patrolServiceMock.getPatrol).toHaveBeenCalledWith(10);

    expect(routerMock.navigate).not.toHaveBeenCalled();

    expect(snackBarMock.open).toHaveBeenCalledWith(
      'Unable to open patrol.',
      'Close',
      { duration: 5000 },
    );
  }, 30000);

  it('should return the correct mission outcome class', () => {
    const fixture = TestBed.createComponent(Dashboard);
    const component = fixture.componentInstance;

    expect(component.outcomeClass('SUCCESS')).toBe(
      'outcome-success',
    );

    expect(component.outcomeClass('PARTIAL_SUCCESS')).toBe(
      'outcome-partial_success',
    );

    expect(component.outcomeClass('FAILURE')).toBe(
      'outcome-failure',
    );
  }, 30000);

  it('should recover from a load error when dashboard is refreshed', () => {
    campaignServiceMock.getCampaigns.mockReturnValueOnce(
      throwError(() => new Error('Unable to load campaigns')),
    );

    const fixture = TestBed.createComponent(Dashboard);
    const component = fixture.componentInstance;

    component.ngOnInit();

    expect(component.loading()).toBe(false);
    expect(component.loadError()).toBe(true);

    campaignServiceMock.getCampaigns.mockReturnValue(
      of({
        content: [],
        totalElements: 6,
        totalPages: 6,
        size: 1,
        number: 0,
        first: true,
        last: false,
        numberOfElements: 1,
        empty: false,
      }),
    );

    vi.clearAllMocks();

    component.refresh();

    expect(campaignServiceMock.getCampaigns).toHaveBeenCalledWith(
      0,
      1,
      'id',
      'asc',
    );

    expect(campaignServiceMock.getCampaignsByStatus).toHaveBeenCalledTimes(3);
    expect(submarineServiceMock.getSubmarines).toHaveBeenCalledTimes(1);
    expect(simulationHistoryServiceMock.getHistory).toHaveBeenCalledWith(
      0,
      5,
    );

    expect(component.loading()).toBe(false);
    expect(component.loadError()).toBe(false);
  }, 30000);

  it('should navigate to campaigns, submarines and simulations lists', () => {
    const fixture = TestBed.createComponent(Dashboard);
    const component = fixture.componentInstance;

    component.openCampaigns();

    expect(routerMock.navigate).toHaveBeenCalledWith(['/campaigns']);

    component.openSubmarines();

    expect(routerMock.navigate).toHaveBeenCalledWith(['/submarines']);

    component.openSimulations();

    expect(routerMock.navigate).toHaveBeenCalledWith(['/simulations']);

    expect(routerMock.navigate).toHaveBeenCalledTimes(3);
  }, 30000);

  it('should reset the opening patrol flag once the patrol resolves', () => {
    patrolServiceMock.getPatrol.mockReturnValue(
      of({
        id: 10,
        campaignId: 3,
      }),
    );

    const fixture = TestBed.createComponent(Dashboard);
    const component = fixture.componentInstance;

    component.ngOnInit();

    expect(component.openingPatrol()).toBeNull();

    const simulation = component.recentSimulations()[0];

    component.openSimulationPatrol(simulation);

    expect(component.openingPatrol()).toBeNull();

    expect(patrolServiceMock.getPatrol).toHaveBeenCalledWith(10);
  }, 30000);

  it('should reset the opening patrol flag when the patrol fails', () => {
    patrolServiceMock.getPatrol.mockReturnValue(
      throwError(() => new Error('Unable to load patrol')),
    );

    const fixture = TestBed.createComponent(Dashboard);
    const component = fixture.componentInstance;

    component.ngOnInit();

    const simulation = component.recentSimulations()[0];

    component.openSimulationPatrol(simulation);

    expect(component.openingPatrol()).toBeNull();

    expect(routerMock.navigate).not.toHaveBeenCalled();
  }, 30000);

  it('should ignore a second patrol request while one is pending', () => {
    // No emitimos nada: el flag sigue activo hasta la primera emision.
    patrolServiceMock.getPatrol.mockReturnValue(
      new Observable<Patrol>(() => {}),
    );

    const fixture = TestBed.createComponent(Dashboard);
    const component = fixture.componentInstance;

    component.ngOnInit();

    const simulation = component.recentSimulations()[0];

    component.openSimulationPatrol(simulation);

    expect(component.openingPatrol()).toBe(10);

    component.openSimulationPatrol(simulation);

    expect(patrolServiceMock.getPatrol).toHaveBeenCalledTimes(1);
  }, 30000);

  it('should return the correct final state class', () => {
    const fixture = TestBed.createComponent(Dashboard);
    const component = fixture.componentInstance;

    expect(component.finalStateClass('COMPLETED')).toBe(
      'state-completed',
    );

    expect(component.finalStateClass('PENDING')).toBe(
      'state-pending',
    );

    expect(component.finalStateClass('ABANDONED')).toBe(
      'state-abandoned',
    );
  }, 30000);
});
