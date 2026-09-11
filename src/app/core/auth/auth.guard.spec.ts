import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';

import { authGuard } from './auth.guard';
import { AuthService } from './auth.service';

describe('authGuard', () => {
  const authServiceMock = {
    isAuthenticated: vi.fn(),
  };

  const routerMock = {
    createUrlTree: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();

    TestBed.configureTestingModule({
      providers: [
        {
          provide: AuthService,
          useValue: authServiceMock,
        },
        {
          provide: Router,
          useValue: routerMock,
        },
      ],
    });
  });

  it('should allow access when the user is authenticated', () => {
    authServiceMock.isAuthenticated.mockReturnValue(true);

    const result = TestBed.runInInjectionContext(() =>
      authGuard({} as never, {} as never),
    );

    expect(
      authServiceMock.isAuthenticated,
    ).toHaveBeenCalledTimes(1);

    expect(
      routerMock.createUrlTree,
    ).not.toHaveBeenCalled();

    expect(result).toBe(true);
  });

  it('should redirect to login when the user is not authenticated', () => {
    authServiceMock.isAuthenticated.mockReturnValue(false);

    const loginUrlTree = {} as ReturnType<Router['createUrlTree']>;

    routerMock.createUrlTree.mockReturnValue(loginUrlTree);

    const result = TestBed.runInInjectionContext(() =>
      authGuard({} as never, {} as never),
    );

    expect(
      authServiceMock.isAuthenticated,
    ).toHaveBeenCalledTimes(1);

    expect(
      routerMock.createUrlTree,
    ).toHaveBeenCalledWith(['/login']);

    expect(result).toBe(loginUrlTree);
  });
});