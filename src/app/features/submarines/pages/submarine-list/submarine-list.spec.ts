import { TestBed } from '@angular/core/testing';
import { ActivatedRoute, Router } from '@angular/router';

import { of, throwError } from 'rxjs';

import { SubmarineList } from './submarine-list';

import { SubmarineService } from '../../data-access/submarine.service';

import {
  Submarine,
} from '../../models/submarine.model';

describe('SubmarineList', () => {
  const submarines: Submarine[] = [
    {
      id: 1,
      name: 'USS Ohio',
      type: 'SSBN',
      submarineClass: 'OHIO',
      nation: 'UNITED_STATES',
      submarineRole: 'SSBN',
      status: 'ACTIVE',
    },
    {
      id: 2,
      name: 'USS Los Angeles',
      type: 'SSN',
      submarineClass: 'LOS_ANGELES',
      nation: 'UNITED_STATES',
      submarineRole: 'SSN',
      status: 'REFIT',
    },
  ];

  const submarineServiceMock = {
    getSubmarines: vi.fn(),
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

  beforeEach(() => {
    vi.clearAllMocks();

    activatedRouteMock.snapshot.queryParamMap.get.mockReturnValue(null);

    submarineServiceMock.getSubmarines.mockReturnValue(
      of(submarines),
    );

    TestBed.configureTestingModule({
      imports: [
        SubmarineList,
      ],
      providers: [
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
      ],
    });
  });

  it('should load all submarines by default', () => {
    const fixture =
      TestBed.createComponent(SubmarineList);

    const component =
      fixture.componentInstance;

    expect(
      submarineServiceMock.getSubmarines,
    ).toHaveBeenCalledTimes(1);

    expect(
      component.selectedStatus(),
    ).toBe('ALL');

    expect(
      component.selectedRole(),
    ).toBe('ALL');

    expect(
      component.allSubmarines(),
    ).toEqual(submarines);

    expect(
      component.submarines(),
    ).toEqual(submarines);

    expect(
      component.loading(),
    ).toBe(false);

    expect(
      component.loadError(),
    ).toBe(false);
  });

  it('should apply status filter from query params', () => {
    activatedRouteMock.snapshot.queryParamMap.get.mockReturnValue('REFIT');

    const fixture =
      TestBed.createComponent(SubmarineList);

    const component =
      fixture.componentInstance;

    expect(
      component.selectedStatus(),
    ).toBe('REFIT');

    expect(
      component.selectedRole(),
    ).toBe('ALL');

    expect(
      submarineServiceMock.getSubmarines,
    ).toHaveBeenCalledTimes(1);

    expect(
      component.allSubmarines(),
    ).toEqual(submarines);

    expect(
      component.submarines(),
    ).toEqual([submarines[1]]);

    expect(
      component.loading(),
    ).toBe(false);

    expect(
      component.loadError(),
    ).toBe(false);
  });

  it('should combine status and role filters', () => {
    const mixedSubmarines: Submarine[] = [
      ...submarines,
      {
        id: 3,
        name: 'USS Michigan',
        type: 'SSBN',
        submarineClass: 'OHIO',
        nation: 'UNITED_STATES',
        submarineRole: 'SSBN',
        status: 'REFIT',
      },
    ];

    submarineServiceMock.getSubmarines.mockReturnValue(
      of(mixedSubmarines),
    );

    const fixture =
      TestBed.createComponent(SubmarineList);

    const component =
      fixture.componentInstance;

    component.onStatusChange('REFIT');

    expect(
      component.submarines(),
    ).toEqual([
      mixedSubmarines[1],
      mixedSubmarines[2],
    ]);

    component.onRoleChange('SSBN');

    expect(
      component.selectedStatus(),
    ).toBe('REFIT');

    expect(
      component.selectedRole(),
    ).toBe('SSBN');

    expect(
      component.submarines(),
    ).toEqual([
      mixedSubmarines[2],
    ]);

    expect(
      submarineServiceMock.getSubmarines,
    ).toHaveBeenCalledTimes(1);
  });

  it('should clear status and role filters', () => {
    const fixture =
      TestBed.createComponent(SubmarineList);

    const component =
      fixture.componentInstance;

    component.onStatusChange('REFIT');
    component.onRoleChange('SSN');

    expect(
      component.selectedStatus(),
    ).toBe('REFIT');

    expect(
      component.selectedRole(),
    ).toBe('SSN');

    expect(
      component.submarines(),
    ).toEqual([submarines[1]]);

    component.clearFilters();

    expect(
      component.selectedStatus(),
    ).toBe('ALL');

    expect(
      component.selectedRole(),
    ).toBe('ALL');

    expect(
      component.submarines(),
    ).toEqual(submarines);

    expect(
      submarineServiceMock.getSubmarines,
    ).toHaveBeenCalledTimes(1);
  });

  it('should reload submarines on refresh and preserve filters', () => {
    const fixture =
      TestBed.createComponent(SubmarineList);

    const component =
      fixture.componentInstance;

    component.onStatusChange('REFIT');

    expect(
      component.submarines(),
    ).toEqual([submarines[1]]);

    expect(
      submarineServiceMock.getSubmarines,
    ).toHaveBeenCalledTimes(1);

    component.refresh();

    expect(
      submarineServiceMock.getSubmarines,
    ).toHaveBeenCalledTimes(2);

    expect(
      component.selectedStatus(),
    ).toBe('REFIT');

    expect(
      component.selectedRole(),
    ).toBe('ALL');

    expect(
      component.submarines(),
    ).toEqual([submarines[1]]);

    expect(
      component.loading(),
    ).toBe(false);

    expect(
      component.loadError(),
    ).toBe(false);
  });

  it('should handle submarine loading errors', () => {
    submarineServiceMock.getSubmarines.mockReturnValue(
      throwError(() => new Error('Backend unavailable')),
    );

    const fixture =
      TestBed.createComponent(SubmarineList);

    const component =
      fixture.componentInstance;

    expect(
      submarineServiceMock.getSubmarines,
    ).toHaveBeenCalledTimes(1);

    expect(
      component.loading(),
    ).toBe(false);

    expect(
      component.loadError(),
    ).toBe(true);

    expect(
      component.submarines(),
    ).toEqual([]);
  });
});