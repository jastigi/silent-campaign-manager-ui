import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, Router } from '@angular/router';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { of, Subject, throwError } from 'rxjs';
import { vi } from 'vitest';

import { PatrolForm } from './patrol-form';
import { PatrolService } from '../../data-access/patrol.service';
import { Patrol } from '../../models/patrol.model';
import { SubmarineService } from '../../../submarines/data-access/submarine.service';
import { Submarine } from '../../../submarines/models/submarine.model';

describe('PatrolForm', () => {
  let fixture: ComponentFixture<PatrolForm>;
  let component: PatrolForm;

  const patrolServiceMock = {
    createPatrol: vi.fn(),
    updatePatrol: vi.fn(),
    getPatrol: vi.fn(),
  };

  const submarineServiceMock = {
    getSubmarines: vi.fn(),
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

  const patrol: Patrol = {
    id: 10,
    patrolName: 'North Atlantic Patrol',
    patrolDate: '2026-09-01',
    area: 'North Atlantic',
    result: null,
    campaignId: 1,
    submarineId: 1,
    submarineName: 'USS Ohio',
    missionType: 'DETERRENCE_PATROL',
    detectedContacts: 3,
  };

  beforeEach(async () => {
    activatedRouteMock.snapshot.paramMap.get.mockReset();
    activatedRouteMock.snapshot.paramMap.get.mockReturnValue(null);

    submarineServiceMock.getSubmarines.mockReturnValue(of([]));

    await TestBed.overrideComponent(PatrolForm, {
      remove: {
        imports: [MatSnackBarModule],
      },
    });

    await TestBed.configureTestingModule({
      imports: [PatrolForm],
      providers: [
        {
          provide: PatrolService,
          useValue: patrolServiceMock,
        },
        {
          provide: SubmarineService,
          useValue: submarineServiceMock,
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
    }).compileComponents();

    fixture = TestBed.createComponent(PatrolForm);
    component = fixture.componentInstance;

    vi.clearAllMocks();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should set an error when campaignId is invalid', () => {
    expect(component.submarinesLoading()).toBe(false);
    expect(component.submarinesError()).toBe(true);

    expect(component.editing()).toBe(false);
    expect(component.loadError()).toBe(false);

    expect(submarineServiceMock.getSubmarines).not.toHaveBeenCalled();
    expect(patrolServiceMock.getPatrol).not.toHaveBeenCalled();
  }, 30000);

  it('should load submarines when campaignId is valid', () => {
    activatedRouteMock.snapshot.paramMap.get.mockImplementation(
      (param: string) => {
        if (param === 'campaignId') {
          return '1';
        }

        return null;
      },
    );

    submarineServiceMock.getSubmarines.mockReturnValue(of([]));

    const validFixture = TestBed.createComponent(PatrolForm);
    const validComponent = validFixture.componentInstance;

    expect(
      submarineServiceMock.getSubmarines,
    ).toHaveBeenCalledTimes(1);

    expect(validComponent.submarinesLoading()).toBe(false);
    expect(validComponent.submarinesError()).toBe(false);

    expect(validComponent.editing()).toBe(false);

    expect(patrolServiceMock.getPatrol).not.toHaveBeenCalled();
  }, 30000);

  it('should store submarines when they are loaded successfully', () => {
    activatedRouteMock.snapshot.paramMap.get.mockImplementation(
      (param: string) => {
        if (param === 'campaignId') {
          return '1';
        }

        return null;
      },
    );

    const submarines: Submarine[] = [
      {
        id: 1,
        name: 'USS Ohio',
        type: 'SSBN',
        submarineClass: 'OHIO',
        nation: 'USA',
        status: 'ACTIVE',
        submarineRole: 'SSBN',
      },
      {
        id: 2,
        name: 'USS Los Angeles',
        type: 'SSN',
        submarineClass: 'LOS_ANGELES',
        nation: 'USA',
        status: 'REFIT',
        submarineRole: 'SSN',
      },
    ];

    submarineServiceMock.getSubmarines.mockReturnValue(of(submarines));

    const validFixture = TestBed.createComponent(PatrolForm);
    const validComponent = validFixture.componentInstance;

    expect(validComponent.submarines()).toEqual(submarines);
    expect(validComponent.submarinesLoading()).toBe(false);
    expect(validComponent.submarinesError()).toBe(false);
  }, 30000);

  it('should set an error when submarines cannot be loaded', () => {
    activatedRouteMock.snapshot.paramMap.get.mockImplementation(
      (param: string) => {
        if (param === 'campaignId') {
          return '1';
        }

        return null;
      },
    );

    submarineServiceMock.getSubmarines.mockReturnValue(
      throwError(() => new Error('Unable to load submarines')),
    );

    const validFixture = TestBed.createComponent(PatrolForm);
    const validComponent = validFixture.componentInstance;

    expect(
      submarineServiceMock.getSubmarines,
    ).toHaveBeenCalledTimes(1);

    expect(validComponent.submarinesLoading()).toBe(false);
    expect(validComponent.submarinesError()).toBe(true);

    expect(validComponent.submarines()).toEqual([]);

    expect(validComponent.editing()).toBe(false);
    expect(patrolServiceMock.getPatrol).not.toHaveBeenCalled();
  }, 30000);

  it('should load the patrol when patrolId is provided', () => {
    activatedRouteMock.snapshot.paramMap.get.mockImplementation(
      (param: string) => {
        if (param === 'campaignId') {
          return '1';
        }

        if (param === 'patrolId') {
          return '10';
        }

        return null;
      },
    );

    submarineServiceMock.getSubmarines.mockReturnValue(of([]));

    patrolServiceMock.getPatrol.mockReturnValue(of(patrol));

    const editFixture = TestBed.createComponent(PatrolForm);
    const editComponent = editFixture.componentInstance;

    expect(editComponent.editing()).toBe(true);

    expect(patrolServiceMock.getPatrol).toHaveBeenCalledTimes(1);

    expect(patrolServiceMock.getPatrol).toHaveBeenCalledWith(10);
  }, 30000);

  it('should populate the form when the patrol is loaded', () => {
    activatedRouteMock.snapshot.paramMap.get.mockImplementation(
      (param: string) => {
        if (param === 'campaignId') {
          return '1';
        }

        if (param === 'patrolId') {
          return '10';
        }

        return null;
      },
    );

    submarineServiceMock.getSubmarines.mockReturnValue(of([]));

    patrolServiceMock.getPatrol.mockReturnValue(of(patrol));

    const editFixture = TestBed.createComponent(PatrolForm);
    const editComponent = editFixture.componentInstance;

    expect(editComponent.form.getRawValue()).toEqual({
      patrolName: patrol.patrolName,
      patrolDate: patrol.patrolDate,
      area: patrol.area,
      submarineId: patrol.submarineId,
      missionType: patrol.missionType,
    });

    expect(editComponent.loading()).toBe(false);
    expect(editComponent.loadError()).toBe(false);
  }, 30000);

  it('should set an error when the patrol cannot be loaded', () => {
    activatedRouteMock.snapshot.paramMap.get.mockImplementation(
      (param: string) => {
        if (param === 'campaignId') {
          return '1';
        }

        if (param === 'patrolId') {
          return '10';
        }

        return null;
      },
    );

    submarineServiceMock.getSubmarines.mockReturnValue(of([]));

    patrolServiceMock.getPatrol.mockReturnValue(
      throwError(() => new Error('Unable to load patrol')),
    );

    const editFixture = TestBed.createComponent(PatrolForm);
    const editComponent = editFixture.componentInstance;

    expect(editComponent.editing()).toBe(true);

    expect(patrolServiceMock.getPatrol).toHaveBeenCalledWith(10);

    expect(editComponent.loading()).toBe(false);
    expect(editComponent.loadError()).toBe(true);

    expect(snackBarMock.open).not.toHaveBeenCalled();
    expect(routerMock.navigate).not.toHaveBeenCalled();
  }, 30000);

  it('should create a patrol when the form is valid', () => {
    activatedRouteMock.snapshot.paramMap.get.mockImplementation(
      (param: string) => {
        if (param === 'campaignId') {
          return '1';
        }

        return null;
      },
    );

    submarineServiceMock.getSubmarines.mockReturnValue(of([]));

    patrolServiceMock.createPatrol.mockReturnValue(of(patrol));

    const createFixture = TestBed.createComponent(PatrolForm);
    const createComponent = createFixture.componentInstance;

    createComponent.form.setValue({
      patrolName: '  North Atlantic Patrol  ',
      patrolDate: '2026-09-01',
      area: '  North Atlantic  ',
      submarineId: 1,
      missionType: 'DETERRENCE_PATROL',
    });

    createComponent.save();

    expect(patrolServiceMock.createPatrol).toHaveBeenCalledTimes(1);

    expect(patrolServiceMock.createPatrol).toHaveBeenCalledWith(
      1,
      {
        patrolName: 'North Atlantic Patrol',
        patrolDate: '2026-09-01',
        area: 'North Atlantic',
        submarineId: 1,
        missionType: 'DETERRENCE_PATROL',
      },
    );

    expect(patrolServiceMock.updatePatrol).not.toHaveBeenCalled();

    expect(createComponent.saving()).toBe(false);

    expect(snackBarMock.open).toHaveBeenCalledWith(
      'Patrol created successfully.',
      'Close',
      {
        duration: 4000,
      },
    );

    expect(routerMock.navigate).toHaveBeenCalledWith([
      '/campaigns',
      1,
      'patrols',
      patrol.id,
    ]);
  }, 30000);

  it('should send null when the patrol area contains only whitespace', () => {
    activatedRouteMock.snapshot.paramMap.get.mockImplementation(
      (param: string) => {
        if (param === 'campaignId') {
          return '1';
        }

        return null;
      },
    );

    submarineServiceMock.getSubmarines.mockReturnValue(of([]));

    patrolServiceMock.createPatrol.mockReturnValue(of(patrol));

    const createFixture = TestBed.createComponent(PatrolForm);
    const createComponent = createFixture.componentInstance;

    createComponent.form.setValue({
      patrolName: 'North Atlantic Patrol',
      patrolDate: '2026-09-01',
      area: '   ',
      submarineId: 1,
      missionType: 'DETERRENCE_PATROL',
    });

    createComponent.save();

    expect(patrolServiceMock.createPatrol).toHaveBeenCalledWith(
      1,
      {
        patrolName: 'North Atlantic Patrol',
        patrolDate: '2026-09-01',
        area: null,
        submarineId: 1,
        missionType: 'DETERRENCE_PATROL',
      },
    );
  }, 30000);

  it('should not save when the form is invalid', () => {
    activatedRouteMock.snapshot.paramMap.get.mockImplementation(
      (param: string) => {
        if (param === 'campaignId') {
          return '1';
        }

        return null;
      },
    );

    submarineServiceMock.getSubmarines.mockReturnValue(of([]));

    const createFixture = TestBed.createComponent(PatrolForm);
    const createComponent = createFixture.componentInstance;

    expect(createComponent.form.invalid).toBe(true);

    createComponent.save();

    expect(patrolServiceMock.createPatrol).not.toHaveBeenCalled();

    expect(patrolServiceMock.updatePatrol).not.toHaveBeenCalled();

    expect(createComponent.form.touched).toBe(true);

    expect(createComponent.saving()).toBe(false);

    expect(snackBarMock.open).not.toHaveBeenCalled();
    expect(routerMock.navigate).not.toHaveBeenCalled();
  }, 30000);

  it('should show the default error when patrol creation fails', () => {
    activatedRouteMock.snapshot.paramMap.get.mockImplementation(
      (param: string) => {
        if (param === 'campaignId') {
          return '1';
        }

        return null;
      },
    );

    submarineServiceMock.getSubmarines.mockReturnValue(of([]));

    patrolServiceMock.createPatrol.mockReturnValue(
      throwError(() => new Error('Network error')),
    );

    const createFixture = TestBed.createComponent(PatrolForm);
    const createComponent = createFixture.componentInstance;

    createComponent.form.setValue({
      patrolName: 'North Atlantic Patrol',
      patrolDate: '2026-09-01',
      area: 'North Atlantic',
      submarineId: 1,
      missionType: 'DETERRENCE_PATROL',
    });

    createComponent.save();

    expect(patrolServiceMock.createPatrol).toHaveBeenCalledTimes(1);

    expect(createComponent.saving()).toBe(false);

    expect(snackBarMock.open).toHaveBeenCalledWith(
      'Unable to create patrol.',
      'Close',
      {
        duration: 6000,
      },
    );

    expect(routerMock.navigate).not.toHaveBeenCalled();
  }, 30000);

  it('should show the backend error message when patrol creation fails', () => {
    activatedRouteMock.snapshot.paramMap.get.mockImplementation(
      (param: string) => {
        if (param === 'campaignId') {
          return '1';
        }

        return null;
      },
    );

    submarineServiceMock.getSubmarines.mockReturnValue(of([]));

    patrolServiceMock.createPatrol.mockReturnValue(
      throwError(() => ({
        error: {
          message: 'Patrol cannot be created.',
        },
      })),
    );

    const createFixture = TestBed.createComponent(PatrolForm);
    const createComponent = createFixture.componentInstance;

    createComponent.form.setValue({
      patrolName: 'North Atlantic Patrol',
      patrolDate: '2026-09-01',
      area: 'North Atlantic',
      submarineId: 1,
      missionType: 'DETERRENCE_PATROL',
    });

    createComponent.save();

    expect(patrolServiceMock.createPatrol).toHaveBeenCalledTimes(1);

    expect(createComponent.saving()).toBe(false);

    expect(snackBarMock.open).toHaveBeenCalledWith(
      'Patrol cannot be created.',
      'Close',
      {
        duration: 6000,
      },
    );

    expect(routerMock.navigate).not.toHaveBeenCalled();
  }, 30000);

  it('should prevent saving again while patrol creation is in progress', () => {
    activatedRouteMock.snapshot.paramMap.get.mockImplementation(
      (param: string) => {
        if (param === 'campaignId') {
          return '1';
        }

        return null;
      },
    );

    submarineServiceMock.getSubmarines.mockReturnValue(of([]));

    const patrolSubject = new Subject<Patrol>();

    patrolServiceMock.createPatrol.mockReturnValue(
      patrolSubject.asObservable(),
    );

    const createFixture = TestBed.createComponent(PatrolForm);
    const createComponent = createFixture.componentInstance;

    createComponent.form.setValue({
      patrolName: 'North Atlantic Patrol',
      patrolDate: '2026-09-01',
      area: 'North Atlantic',
      submarineId: 1,
      missionType: 'DETERRENCE_PATROL',
    });

    createComponent.save();

    expect(createComponent.saving()).toBe(true);
    expect(patrolServiceMock.createPatrol).toHaveBeenCalledTimes(1);

    createComponent.save();

    expect(createComponent.saving()).toBe(true);
    expect(patrolServiceMock.createPatrol).toHaveBeenCalledTimes(1);

    patrolSubject.next(patrol);
    patrolSubject.complete();

    expect(createComponent.saving()).toBe(false);

    expect(snackBarMock.open).toHaveBeenCalledWith(
      'Patrol created successfully.',
      'Close',
      {
        duration: 4000,
      },
    );

    expect(routerMock.navigate).toHaveBeenCalledTimes(1);
  }, 30000);

  it('should update a patrol when editing and the form is valid', () => {
    activatedRouteMock.snapshot.paramMap.get.mockImplementation(
      (param: string) => {
        if (param === 'campaignId') {
          return '1';
        }

        if (param === 'patrolId') {
          return '10';
        }

        return null;
      },
    );

    submarineServiceMock.getSubmarines.mockReturnValue(of([]));

    patrolServiceMock.getPatrol.mockReturnValue(of(patrol));
    patrolServiceMock.updatePatrol.mockReturnValue(of(patrol));

    const editFixture = TestBed.createComponent(PatrolForm);
    const editComponent = editFixture.componentInstance;

    expect(editComponent.editing()).toBe(true);
    expect(editComponent.form.valid).toBe(true);

    editComponent.form.patchValue({
      patrolName: '  Updated Patrol  ',
      area: '  Mediterranean  ',
    });

    editComponent.save();

    expect(patrolServiceMock.updatePatrol).toHaveBeenCalledTimes(1);

    expect(patrolServiceMock.updatePatrol).toHaveBeenCalledWith(
      1,
      10,
      {
        patrolName: 'Updated Patrol',
        patrolDate: patrol.patrolDate,
        area: 'Mediterranean',
        submarineId: patrol.submarineId,
        missionType: patrol.missionType,
      },
    );

    expect(patrolServiceMock.createPatrol).not.toHaveBeenCalled();

    expect(editComponent.saving()).toBe(false);

    expect(snackBarMock.open).toHaveBeenCalledWith(
      'Patrol updated successfully.',
      'Close',
      {
        duration: 4000,
      },
    );

    expect(routerMock.navigate).toHaveBeenCalledWith([
      '/campaigns',
      1,
      'patrols',
      10,
    ]);
  }, 30000);

  it('should show the default error when patrol update fails', () => {
    activatedRouteMock.snapshot.paramMap.get.mockImplementation(
      (param: string) => {
        if (param === 'campaignId') {
          return '1';
        }

        if (param === 'patrolId') {
          return '10';
        }

        return null;
      },
    );

    submarineServiceMock.getSubmarines.mockReturnValue(of([]));

    patrolServiceMock.getPatrol.mockReturnValue(of(patrol));

    patrolServiceMock.updatePatrol.mockReturnValue(
      throwError(() => new Error('Network error')),
    );

    const editFixture = TestBed.createComponent(PatrolForm);
    const editComponent = editFixture.componentInstance;

    expect(editComponent.editing()).toBe(true);
    expect(editComponent.form.valid).toBe(true);

    editComponent.save();

    expect(patrolServiceMock.updatePatrol).toHaveBeenCalledTimes(1);

    expect(patrolServiceMock.createPatrol).not.toHaveBeenCalled();

    expect(editComponent.saving()).toBe(false);

    expect(snackBarMock.open).toHaveBeenCalledWith(
      'Unable to update patrol.',
      'Close',
      {
        duration: 6000,
      },
    );

    expect(routerMock.navigate).not.toHaveBeenCalled();
  }, 30000);

  it('should show the backend error message when patrol update fails', () => {
    activatedRouteMock.snapshot.paramMap.get.mockImplementation(
      (param: string) => {
        if (param === 'campaignId') {
          return '1';
        }

        if (param === 'patrolId') {
          return '10';
        }

        return null;
      },
    );

    submarineServiceMock.getSubmarines.mockReturnValue(of([]));

    patrolServiceMock.getPatrol.mockReturnValue(of(patrol));

    patrolServiceMock.updatePatrol.mockReturnValue(
      throwError(() => ({
        error: {
          message: 'Patrol cannot be updated.',
        },
      })),
    );

    const editFixture = TestBed.createComponent(PatrolForm);
    const editComponent = editFixture.componentInstance;

    expect(editComponent.editing()).toBe(true);
    expect(editComponent.form.valid).toBe(true);

    editComponent.save();

    expect(patrolServiceMock.updatePatrol).toHaveBeenCalledTimes(1);

    expect(patrolServiceMock.createPatrol).not.toHaveBeenCalled();

    expect(editComponent.saving()).toBe(false);

    expect(snackBarMock.open).toHaveBeenCalledWith(
      'Patrol cannot be updated.',
      'Close',
      {
        duration: 6000,
      },
    );

    expect(routerMock.navigate).not.toHaveBeenCalled();
  }, 30000);

  it('should navigate back to the campaign when cancelling creation', () => {
    activatedRouteMock.snapshot.paramMap.get.mockImplementation(
      (param: string) => {
        if (param === 'campaignId') {
          return '1';
        }

        return null;
      },
    );

    submarineServiceMock.getSubmarines.mockReturnValue(of([]));

    const createFixture = TestBed.createComponent(PatrolForm);
    const createComponent = createFixture.componentInstance;

    expect(createComponent.editing()).toBe(false);

    createComponent.cancel();

    expect(routerMock.navigate).toHaveBeenCalledTimes(1);

    expect(routerMock.navigate).toHaveBeenCalledWith([
      '/campaigns',
      1,
    ]);
  }, 30000);

  it('should navigate back to the patrol when cancelling an edit', () => {
    activatedRouteMock.snapshot.paramMap.get.mockImplementation(
      (param: string) => {
        if (param === 'campaignId') {
          return '1';
        }

        if (param === 'patrolId') {
          return '10';
        }

        return null;
      },
    );

    submarineServiceMock.getSubmarines.mockReturnValue(of([]));

    patrolServiceMock.getPatrol.mockReturnValue(of(patrol));

    const editFixture = TestBed.createComponent(PatrolForm);
    const editComponent = editFixture.componentInstance;

    expect(editComponent.editing()).toBe(true);

    editComponent.cancel();

    expect(routerMock.navigate).toHaveBeenCalledTimes(1);

    expect(routerMock.navigate).toHaveBeenCalledWith([
      '/campaigns',
      1,
      'patrols',
      10,
    ]);
  }, 30000);

  it('should format enum values for display', () => {
    const fixture = TestBed.createComponent(PatrolForm);
    const component = fixture.componentInstance;

    expect(component.formatValue('LOS_ANGELES')).toBe('LOS ANGELES');
    expect(component.formatValue('DETERRENCE_PATROL')).toBe(
      'DETERRENCE PATROL',
    );
    expect(component.formatValue('ATTACK')).toBe('ATTACK');
  }, 30000);
});
