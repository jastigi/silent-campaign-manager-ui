import { TestBed } from '@angular/core/testing';
import { ActivatedRoute, Router } from '@angular/router';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { of, throwError } from 'rxjs';

import { SubmarineDetail } from './submarine-detail';
import { SubmarineService } from '../../data-access/submarine.service';
import { Submarine } from '../../models/submarine.model';

describe('SubmarineDetail', () => {
  const submarineServiceMock = {
    getSubmarineById: vi.fn(),
    deleteSubmarine: vi.fn(),
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

  const submarine: Submarine = {
    id: 1,
    name: 'USS Ohio',
    type: 'SSBN',
    submarineClass: 'OHIO',
    nation: 'USA',
    status: 'ACTIVE',
    submarineRole: 'SSBN',
  };

  beforeEach(() => {
    TestBed.overrideComponent(SubmarineDetail, {
      remove: {
        imports: [MatSnackBarModule],
      },
    });

    vi.clearAllMocks();

    // Restablecer el comportamiento de la ruta entre tests.
    activatedRouteMock.snapshot.paramMap.get.mockReset();
    activatedRouteMock.snapshot.paramMap.get.mockReturnValue('1');

    submarineServiceMock.getSubmarineById.mockReturnValue(of(submarine));

    TestBed.configureTestingModule({
      imports: [SubmarineDetail],
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
        {
          provide: MatSnackBar,
          useValue: snackBarMock,
        },
      ],
    });
  });

  it('should load submarine details', () => {
    const fixture = TestBed.createComponent(SubmarineDetail);
    const component = fixture.componentInstance;

    expect(submarineServiceMock.getSubmarineById).toHaveBeenCalledWith(1);

    expect(component.submarine()).toEqual(submarine);
    expect(component.loading()).toBe(false);
    expect(component.loadError()).toBe(false);
    expect(component.deleting()).toBe(false);

    expect(component.statusClass('ACTIVE')).toBe(
      'submarine-status-active',
    );

    expect(component.formatClass('LOS_ANGELES')).toBe(
      'LOS ANGELES',
    );
  }, 30000);

  it('should report a load error when the submarine id is invalid', () => {
    activatedRouteMock.snapshot.paramMap.get.mockReturnValue('invalid');

    const fixture = TestBed.createComponent(SubmarineDetail);
    const component = fixture.componentInstance;

    expect(component.submarine()).toBeNull();
    expect(component.loading()).toBe(false);
    expect(component.loadError()).toBe(true);
    expect(component.deleting()).toBe(false);

    expect(submarineServiceMock.getSubmarineById).not.toHaveBeenCalled();
    expect(submarineServiceMock.deleteSubmarine).not.toHaveBeenCalled();
    expect(routerMock.navigate).not.toHaveBeenCalled();
  }, 30000);

  it('should report a load error when loading a submarine fails', () => {
    submarineServiceMock.getSubmarineById.mockReturnValue(
      throwError(() => new Error('Unable to load submarine')),
    );

    const fixture = TestBed.createComponent(SubmarineDetail);
    const component = fixture.componentInstance;

    expect(submarineServiceMock.getSubmarineById).toHaveBeenCalledWith(1);

    expect(component.submarine()).toBeNull();
    expect(component.loading()).toBe(false);
    expect(component.loadError()).toBe(true);
    expect(component.deleting()).toBe(false);

    expect(submarineServiceMock.deleteSubmarine).not.toHaveBeenCalled();
    expect(routerMock.navigate).not.toHaveBeenCalled();
  }, 30000);

  it('should navigate to submarine edit page', () => {
    const fixture = TestBed.createComponent(SubmarineDetail);
    const component = fixture.componentInstance;

    expect(component.submarine()).toEqual(submarine);

    component.edit();

    expect(routerMock.navigate).toHaveBeenCalledWith([
      '/submarines',
      1,
      'edit',
    ]);

    expect(submarineServiceMock.deleteSubmarine).not.toHaveBeenCalled();
  }, 30000);

  it('should not navigate to edit when no submarine is loaded', () => {
    submarineServiceMock.getSubmarineById.mockReturnValue(
      throwError(() => new Error('Unable to load submarine')),
    );

    const fixture = TestBed.createComponent(SubmarineDetail);
    const component = fixture.componentInstance;

    expect(component.submarine()).toBeNull();
    expect(component.loadError()).toBe(true);

    component.edit();

    expect(routerMock.navigate).not.toHaveBeenCalled();
    expect(submarineServiceMock.deleteSubmarine).not.toHaveBeenCalled();
  }, 30000);

  it('should navigate back to submarine list', () => {
    const fixture = TestBed.createComponent(SubmarineDetail);
    const component = fixture.componentInstance;

    component.back();

    expect(routerMock.navigate).toHaveBeenCalledWith(['/submarines']);

    expect(submarineServiceMock.deleteSubmarine).not.toHaveBeenCalled();
  }, 30000);

  it('should not delete submarine when confirmation is cancelled', () => {
    const confirmSpy = vi
      .spyOn(window, 'confirm')
      .mockReturnValue(false);

    const fixture = TestBed.createComponent(SubmarineDetail);
    const component = fixture.componentInstance;

    component.delete();

    expect(confirmSpy).toHaveBeenCalledWith(
      'Delete submarine "USS Ohio"?',
    );

    expect(component.deleting()).toBe(false);

    expect(submarineServiceMock.deleteSubmarine).not.toHaveBeenCalled();
    expect(snackBarMock.open).not.toHaveBeenCalled();
    expect(routerMock.navigate).not.toHaveBeenCalled();

    confirmSpy.mockRestore();
  }, 30000);

  it('should delete submarine and navigate to submarine list', () => {
    const confirmSpy = vi
      .spyOn(window, 'confirm')
      .mockReturnValue(true);

    submarineServiceMock.deleteSubmarine.mockReturnValue(
      of(undefined),
    );

    const fixture = TestBed.createComponent(SubmarineDetail);
    const component = fixture.componentInstance;

    component.delete();

    expect(confirmSpy).toHaveBeenCalledWith(
      'Delete submarine "USS Ohio"?',
    );

    expect(submarineServiceMock.deleteSubmarine).toHaveBeenCalledWith(1);

    expect(component.deleting()).toBe(false);

    expect(snackBarMock.open).toHaveBeenCalledWith(
      'Submarine deleted successfully.',
      'Close',
      { duration: 4000 },
    );

    expect(routerMock.navigate).toHaveBeenCalledWith(['/submarines']);

    confirmSpy.mockRestore();
  }, 30000);

  it('should show the backend error when submarine deletion fails', () => {
    const confirmSpy = vi
      .spyOn(window, 'confirm')
      .mockReturnValue(true);

    submarineServiceMock.deleteSubmarine.mockReturnValue(
      throwError(() => ({
        error: {
          message: 'Unable to delete this submarine.',
        },
      })),
    );

    const fixture = TestBed.createComponent(SubmarineDetail);
    const component = fixture.componentInstance;

    component.delete();

    expect(confirmSpy).toHaveBeenCalledWith(
      'Delete submarine "USS Ohio"?',
    );

    expect(submarineServiceMock.deleteSubmarine).toHaveBeenCalledWith(1);

    expect(component.deleting()).toBe(false);

    expect(snackBarMock.open).toHaveBeenCalledWith(
      'Unable to delete this submarine.',
      'Close',
      { duration: 6000 },
    );

    expect(routerMock.navigate).not.toHaveBeenCalled();

    confirmSpy.mockRestore();
  }, 30000);
});