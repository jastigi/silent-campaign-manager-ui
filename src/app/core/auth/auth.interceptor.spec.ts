import { TestBed } from '@angular/core/testing';
import {
  HttpRequest,
  HttpResponse,
} from '@angular/common/http';

import { of } from 'rxjs';

import { authInterceptor } from './auth.interceptor';
import { AuthService } from './auth.service';

describe('authInterceptor', () => {
  const authServiceMock = {
    getToken: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();

    TestBed.configureTestingModule({
      providers: [
        {
          provide: AuthService,
          useValue: authServiceMock,
        },
      ],
    });
  });

  it('should not add authorization header to login requests', () => {
    authServiceMock.getToken.mockReturnValue('existing-token');

    const request = new HttpRequest(
      'POST',
      '/api/v1/auth/login',
      {
        username: 'commander',
        password: 'secret',
      },
    );

    const next = vi.fn((req: HttpRequest<unknown>) => {
      expect(
        req.headers.has('Authorization'),
      ).toBe(false);

      return of(
        new HttpResponse({
          status: 200,
        }),
      );
    });

    TestBed.runInInjectionContext(() =>
      authInterceptor(request, next),
    );

    expect(next).toHaveBeenCalledTimes(1);

    expect(
      authServiceMock.getToken,
    ).not.toHaveBeenCalled();
  });

  it('should add bearer token to protected requests', () => {
    authServiceMock.getToken.mockReturnValue('test-token');

    const request = new HttpRequest(
      'GET',
      '/api/v1/campaigns',
    );

    const next = vi.fn((req: HttpRequest<unknown>) => {
      expect(
        req.headers.get('Authorization'),
      ).toBe('Bearer test-token');

      return of(
        new HttpResponse({
          status: 200,
        }),
      );
    });

    TestBed.runInInjectionContext(() =>
      authInterceptor(request, next),
    );

    expect(
      authServiceMock.getToken,
    ).toHaveBeenCalledTimes(1);

    expect(next).toHaveBeenCalledTimes(1);
  });

  it('should pass protected requests without authorization header when no token exists', () => {
    authServiceMock.getToken.mockReturnValue(null);

    const request = new HttpRequest(
      'GET',
      '/api/v1/campaigns',
    );

    const next = vi.fn((req: HttpRequest<unknown>) => {
      expect(
        req.headers.has('Authorization'),
      ).toBe(false);

      return of(
        new HttpResponse({
          status: 200,
        }),
      );
    });

    TestBed.runInInjectionContext(() =>
      authInterceptor(request, next),
    );

    expect(
      authServiceMock.getToken,
    ).toHaveBeenCalledTimes(1);

    expect(next).toHaveBeenCalledTimes(1);
  });
});