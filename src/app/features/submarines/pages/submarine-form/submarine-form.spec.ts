import { TestBed } from '@angular/core/testing';
import { ActivatedRoute, Router } from '@angular/router';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

import { of, throwError } from 'rxjs';

import { SubmarineForm } from './submarine-form';
import { SubmarineService } from '../../data-access/submarine.service';

describe('SubmarineForm', () => {
  const submarineServiceMock = {
    getSubmarineById: vi.fn(),
    createSubmarine: vi.fn(),
    updateSubmarine: vi.fn(),
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
    TestBed.overrideComponent(SubmarineForm, {
      remove: {
        imports: [MatSnackBarModule],
      },
    });

    vi.clearAllMocks();

    activatedRouteMock.snapshot.paramMap.get.mockReset();
    activatedRouteMock.snapshot.paramMap.get.mockReturnValue(null);

    TestBed.configureTestingModule({
      imports: [SubmarineForm],
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

  it('should initialize in create mode when no submarine id is provided', () => {
    const fixture = TestBed.createComponent(SubmarineForm);
    const component = fixture.componentInstance;

    expect(component.isEditMode).toBe(false);
    expect(component.submarineId()).toBeNull();

    expect(component.loading()).toBe(false);
    expect(component.loadError()).toBe(false);
    expect(component.saving()).toBe(false);

    expect(
      submarineServiceMock.getSubmarineById,
    ).not.toHaveBeenCalled();

    expect(component.form.getRawValue()).toEqual({
      name: '',
      type: null,
      submarineClass: null,
      nation: '',
      status: null,
      submarineRole: null,
    });

    expect(component.form.invalid).toBe(true);
  }, 30000);

  it('should load an existing submarine in edit mode', () => {
    activatedRouteMock.snapshot.paramMap.get.mockReturnValue('1');

    const existingSubmarine = {
      id: 1,
      name: 'USS Ohio',
      type: 'SSBN' as const,
      submarineClass: 'OHIO' as const,
      nation: 'USA',
      status: 'ACTIVE' as const,
      submarineRole: 'SSBN' as const,
    };

    submarineServiceMock.getSubmarineById.mockReturnValue(
      of(existingSubmarine),
    );

    const fixture = TestBed.createComponent(SubmarineForm);
    const component = fixture.componentInstance;

    expect(submarineServiceMock.getSubmarineById).toHaveBeenCalledWith(1);

    expect(component.isEditMode).toBe(true);
    expect(component.submarineId()).toBe(1);

    expect(component.loading()).toBe(false);
    expect(component.loadError()).toBe(false);
    expect(component.saving()).toBe(false);

    expect(component.form.getRawValue()).toEqual({
      name: 'USS Ohio',
      type: 'SSBN',
      submarineClass: 'OHIO',
      nation: 'USA',
      status: 'ACTIVE',
      submarineRole: 'SSBN',
    });

    expect(component.form.valid).toBe(true);
  }, 30000);

  it('should report a load error when the submarine id is invalid', () => {
    activatedRouteMock.snapshot.paramMap.get.mockReturnValue('invalid');

    const fixture = TestBed.createComponent(SubmarineForm);
    const component = fixture.componentInstance;

    expect(component.loadError()).toBe(true);
    expect(component.loading()).toBe(false);
    expect(component.saving()).toBe(false);

    expect(
      submarineServiceMock.getSubmarineById,
    ).not.toHaveBeenCalled();

    expect(
      submarineServiceMock.createSubmarine,
    ).not.toHaveBeenCalled();

    expect(
      submarineServiceMock.updateSubmarine,
    ).not.toHaveBeenCalled();
  }, 30000);

  it('should report a load error when loading a submarine fails', () => {
    activatedRouteMock.snapshot.paramMap.get.mockReturnValue('1');

    submarineServiceMock.getSubmarineById.mockReturnValue(
      throwError(() => new Error('Unable to load submarine')),
    );

    const fixture = TestBed.createComponent(SubmarineForm);
    const component = fixture.componentInstance;

    expect(submarineServiceMock.getSubmarineById).toHaveBeenCalledWith(1);

    expect(component.loading()).toBe(false);
    expect(component.loadError()).toBe(true);
    expect(component.saving()).toBe(false);

    expect(submarineServiceMock.createSubmarine).not.toHaveBeenCalled();
    expect(submarineServiceMock.updateSubmarine).not.toHaveBeenCalled();
  }, 30000);

  it('should not save an invalid submarine form', () => {
    const fixture = TestBed.createComponent(SubmarineForm);
    const component = fixture.componentInstance;

    // En modo creación, los campos obligatorios comienzan vacíos.
    expect(component.form.invalid).toBe(true);

    component.save();

    expect(component.form.controls.name.touched).toBe(true);
    expect(component.form.controls.type.touched).toBe(true);
    expect(component.form.controls.submarineClass.touched).toBe(true);
    expect(component.form.controls.nation.touched).toBe(true);
    expect(component.form.controls.status.touched).toBe(true);
    expect(component.form.controls.submarineRole.touched).toBe(true);

    expect(component.saving()).toBe(false);

    expect(submarineServiceMock.createSubmarine).not.toHaveBeenCalled();
    expect(submarineServiceMock.updateSubmarine).not.toHaveBeenCalled();
    expect(routerMock.navigate).not.toHaveBeenCalled();
  }, 30000);

  it('should create a submarine and navigate to its detail', () => {
    const createdSubmarine = {
      id: 7,
      name: 'USS Ohio',
      type: 'SSBN' as const,
      submarineClass: 'OHIO' as const,
      nation: 'USA',
      status: 'ACTIVE' as const,
      submarineRole: 'SSBN' as const,
    };

    submarineServiceMock.createSubmarine.mockReturnValue(
      of(createdSubmarine),
    );

    const fixture = TestBed.createComponent(SubmarineForm);
    const component = fixture.componentInstance;

    component.form.setValue({
      name: '  USS Ohio  ',
      type: 'SSBN',
      submarineClass: 'OHIO',
      nation: '  USA  ',
      status: 'ACTIVE',
      submarineRole: 'SSBN',
    });

    expect(component.form.valid).toBe(true);

    component.save();

    expect(submarineServiceMock.createSubmarine).toHaveBeenCalledWith({
      name: 'USS Ohio',
      type: 'SSBN',
      submarineClass: 'OHIO',
      nation: 'USA',
      status: 'ACTIVE',
      submarineRole: 'SSBN',
    });

    expect(submarineServiceMock.updateSubmarine).not.toHaveBeenCalled();
    expect(component.saving()).toBe(false);

    expect(snackBarMock.open).toHaveBeenCalledWith(
      'Submarine created successfully.',
      'Close',
      { duration: 4000 },
    );

    expect(routerMock.navigate).toHaveBeenCalledWith(['/submarines', 7]);
  }, 30000);

  it('should show the backend error when submarine creation fails', () => {
    submarineServiceMock.createSubmarine.mockReturnValue(
      throwError(() => ({
        error: {
          message: 'Submarine name already exists.',
        },
      })),
    );

    const fixture = TestBed.createComponent(SubmarineForm);
    const component = fixture.componentInstance;

    component.form.setValue({
      name: 'USS Ohio',
      type: 'SSBN',
      submarineClass: 'OHIO',
      nation: 'USA',
      status: 'ACTIVE',
      submarineRole: 'SSBN',
    });

    component.save();

    expect(submarineServiceMock.createSubmarine).toHaveBeenCalledWith({
      name: 'USS Ohio',
      type: 'SSBN',
      submarineClass: 'OHIO',
      nation: 'USA',
      status: 'ACTIVE',
      submarineRole: 'SSBN',
    });

    expect(submarineServiceMock.updateSubmarine).not.toHaveBeenCalled();
    expect(component.saving()).toBe(false);

    expect(snackBarMock.open).toHaveBeenCalledWith(
      'Submarine name already exists.',
      'Close',
      { duration: 6000 },
    );

    expect(routerMock.navigate).not.toHaveBeenCalled();
  }, 30000);

  it('should update an existing submarine and navigate to its detail', () => {
    activatedRouteMock.snapshot.paramMap.get.mockReturnValue('1');

    const existingSubmarine = {
      id: 1,
      name: 'USS Ohio',
      type: 'SSBN' as const,
      submarineClass: 'OHIO' as const,
      nation: 'USA',
      status: 'ACTIVE' as const,
      submarineRole: 'SSBN' as const,
    };

    const updatedSubmarine = {
      ...existingSubmarine,
      name: 'USS Ohio Updated',
      status: 'REFIT' as const,
      submarineRole: 'SSN' as const,
    };

    submarineServiceMock.getSubmarineById.mockReturnValue(
      of(existingSubmarine),
    );

    submarineServiceMock.updateSubmarine.mockReturnValue(
      of(updatedSubmarine),
    );

    const fixture = TestBed.createComponent(SubmarineForm);
    const component = fixture.componentInstance;

    expect(component.isEditMode).toBe(true);

    component.form.setValue({
      name: '  USS Ohio Updated  ',
      type: 'SSBN',
      submarineClass: 'OHIO',
      nation: '  USA  ',
      status: 'REFIT',
      submarineRole: 'SSN',
    });

    component.save();

    expect(submarineServiceMock.updateSubmarine).toHaveBeenCalledWith(1, {
      name: 'USS Ohio Updated',
      type: 'SSBN',
      submarineClass: 'OHIO',
      nation: 'USA',
      status: 'REFIT',
      submarineRole: 'SSN',
    });

    expect(submarineServiceMock.createSubmarine).not.toHaveBeenCalled();
    expect(component.saving()).toBe(false);

    expect(snackBarMock.open).toHaveBeenCalledWith(
      'Submarine updated successfully.',
      'Close',
      { duration: 4000 },
    );

    expect(routerMock.navigate).toHaveBeenCalledWith(['/submarines', 1]);
  }, 30000);

  it('should show the backend error when submarine update fails', () => {
    activatedRouteMock.snapshot.paramMap.get.mockReturnValue('1');

    const existingSubmarine = {
      id: 1,
      name: 'USS Ohio',
      type: 'SSBN' as const,
      submarineClass: 'OHIO' as const,
      nation: 'USA',
      status: 'ACTIVE' as const,
      submarineRole: 'SSBN' as const,
    };

    submarineServiceMock.getSubmarineById.mockReturnValue(
      of(existingSubmarine),
    );

    submarineServiceMock.updateSubmarine.mockReturnValue(
      throwError(() => ({
        error: {
          message: 'Unable to update this submarine.',
        },
      })),
    );

    const fixture = TestBed.createComponent(SubmarineForm);
    const component = fixture.componentInstance;

    component.form.setValue({
      name: 'USS Ohio Updated',
      type: 'SSBN',
      submarineClass: 'OHIO',
      nation: 'USA',
      status: 'REFIT',
      submarineRole: 'SSN',
    });

    component.save();

    expect(submarineServiceMock.updateSubmarine).toHaveBeenCalledWith(1, {
      name: 'USS Ohio Updated',
      type: 'SSBN',
      submarineClass: 'OHIO',
      nation: 'USA',
      status: 'REFIT',
      submarineRole: 'SSN',
    });

    expect(submarineServiceMock.createSubmarine).not.toHaveBeenCalled();
    expect(component.saving()).toBe(false);

    expect(snackBarMock.open).toHaveBeenCalledWith(
      'Unable to update this submarine.',
      'Close',
      { duration: 6000 },
    );

    expect(routerMock.navigate).not.toHaveBeenCalled();
  }, 30000);

  it('should navigate to submarine list when cancelling creation', () => {
    const fixture = TestBed.createComponent(SubmarineForm);
    const component = fixture.componentInstance;

    expect(component.isEditMode).toBe(false);
    expect(component.submarineId()).toBeNull();

    component.cancel();

    expect(routerMock.navigate).toHaveBeenCalledWith(['/submarines']);

    expect(submarineServiceMock.createSubmarine).not.toHaveBeenCalled();
    expect(submarineServiceMock.updateSubmarine).not.toHaveBeenCalled();
  }, 30000);

  it('should navigate to submarine detail when cancelling edition', () => {
    activatedRouteMock.snapshot.paramMap.get.mockReturnValue('1');

    const existingSubmarine = {
      id: 1,
      name: 'USS Ohio',
      type: 'SSBN' as const,
      submarineClass: 'OHIO' as const,
      nation: 'USA',
      status: 'ACTIVE' as const,
      submarineRole: 'SSBN' as const,
    };

    submarineServiceMock.getSubmarineById.mockReturnValue(
      of(existingSubmarine),
    );

    const fixture = TestBed.createComponent(SubmarineForm);
    const component = fixture.componentInstance;

    expect(component.isEditMode).toBe(true);
    expect(component.submarineId()).toBe(1);

    component.cancel();

    expect(routerMock.navigate).toHaveBeenCalledWith(['/submarines', 1]);

    expect(submarineServiceMock.createSubmarine).not.toHaveBeenCalled();
    expect(submarineServiceMock.updateSubmarine).not.toHaveBeenCalled();
  }, 30000);

  it('should format submarine class values for display', () => {
    const fixture = TestBed.createComponent(SubmarineForm);
    const component = fixture.componentInstance;

    expect(component.formatOption('LOS_ANGELES')).toBe('LOS ANGELES');
    expect(component.formatOption('DELTA_IV')).toBe('DELTA IV');
    expect(component.formatOption('VICTOR_III')).toBe('VICTOR III');
    expect(component.formatOption('OHIO')).toBe('OHIO');
  }, 30000);

  it('should show the fallback message when submarine creation fails without a backend message', () => {
    submarineServiceMock.createSubmarine.mockReturnValue(
      throwError(() => new Error('Network error')),
    );

    const fixture = TestBed.createComponent(SubmarineForm);
    const component = fixture.componentInstance;

    component.form.setValue({
      name: '  USS Ohio  ',
      type: 'SSBN',
      submarineClass: 'OHIO',
      nation: '  USA  ',
      status: 'ACTIVE',
      submarineRole: 'SSBN',
    });

    submarineServiceMock.createSubmarine.mockClear();
    snackBarMock.open.mockClear();
    routerMock.navigate.mockClear();

    component.save();

    expect(component.saving()).toBe(false);

    expect(snackBarMock.open).toHaveBeenCalledWith(
      'Unable to save submarine.',
      'Close',
      { duration: 6000 },
    );

    expect(routerMock.navigate).not.toHaveBeenCalled();
  }, 30000);
});