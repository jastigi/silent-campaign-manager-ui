import { TestBed } from '@angular/core/testing';
import {
  provideHttpClient,
} from '@angular/common/http';

import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';

import { AuthService } from './auth.service';

describe('AuthService', () => {
  let service: AuthService;

  let httpTestingController: HttpTestingController;

  beforeEach(() => {
    localStorage.clear();

    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
      ],
    });

    service = TestBed.inject(AuthService);

    httpTestingController =
      TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpTestingController.verify();

    localStorage.clear();
  });

  it('should return the stored authentication token', () => {
    localStorage.setItem(
      'scm_access_token',
      'test-token',
    );

    expect(
      service.getToken(),
    ).toBe('test-token');
  });

  it('should report authenticated when a token exists', () => {
    localStorage.setItem(
      'scm_access_token',
      'test-token',
    );

    expect(
      service.isAuthenticated(),
    ).toBe(true);
  });

  it('should report unauthenticated when no token exists', () => {
    expect(
      service.isAuthenticated(),
    ).toBe(false);
  });

  it('should remove the authentication token on logout', () => {
    localStorage.setItem(
      'scm_access_token',
      'test-token',
    );

    expect(
      localStorage.getItem('scm_access_token'),
    ).toBe('test-token');

    service.logout();

    expect(
      localStorage.getItem('scm_access_token'),
    ).toBeNull();

    expect(
      service.isAuthenticated(),
    ).toBe(false);
  });

  it('should authenticate and store the returned token', () => {
    const credentials = {
      username: 'commander',
      password: 'secret',
    };

    let responseToken: string | undefined;

    service.login(
      credentials.username,
      credentials.password,
    ).subscribe((response) => {
      responseToken = response.token;
    });

    const request =
      httpTestingController.expectOne(
        '/api/v1/auth/login',
      );

    expect(request.request.method).toBe('POST');

    expect(
      request.request.body,
    ).toEqual(credentials);

    request.flush({
      token: 'backend-token',
    });

    expect(responseToken).toBe('backend-token');

    expect(
      localStorage.getItem('scm_access_token'),
    ).toBe('backend-token');
  });
});