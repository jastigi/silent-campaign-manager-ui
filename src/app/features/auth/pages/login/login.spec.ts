import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { of, Subject, throwError } from 'rxjs';

import { AuthService } from '../../../../core/auth/auth.service';
import { Login } from './login';

describe('Login', () => {
  let authServiceMock: {
    login: ReturnType<typeof vi.fn>;
  };

  let routerMock: {
    navigate: ReturnType<typeof vi.fn>;
  };

  beforeEach(async () => {
    authServiceMock = {
      login: vi.fn().mockReturnValue(of({ token: 'token-123' })),
    };

    routerMock = {
      navigate: vi.fn(),
    };

    await TestBed.configureTestingModule({
      imports: [Login],
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
    }).compileComponents();
  });

  it('should create', () => {
    const fixture = TestBed.createComponent(Login);
    const component = fixture.componentInstance;

    expect(component).toBeTruthy();
  });

  it('should mark the form as touched and not login when the form is invalid', () => {
    const fixture = TestBed.createComponent(Login);
    const component = fixture.componentInstance;

    expect(component.form.invalid).toBe(true);
    expect(component.form.controls.username.touched).toBe(false);
    expect(component.form.controls.password.touched).toBe(false);

    component.submit();

    expect(component.form.controls.username.touched).toBe(true);
    expect(component.form.controls.password.touched).toBe(true);

    expect(authServiceMock.login).not.toHaveBeenCalled();
    expect(routerMock.navigate).not.toHaveBeenCalled();

    expect(component.loading()).toBe(false);
  });

  it('should prevent a second login while a login request is in progress', () => {
    const loginSubject = new Subject<{ token: string }>();

    authServiceMock.login.mockReturnValue(loginSubject.asObservable());

    const fixture = TestBed.createComponent(Login);
    const component = fixture.componentInstance;

    component.form.setValue({
      username: 'admin',
      password: 'password',
    });

    expect(component.form.valid).toBe(true);

    component.submit();

    expect(component.loading()).toBe(true);
    expect(authServiceMock.login).toHaveBeenCalledTimes(1);

    component.submit();

    expect(authServiceMock.login).toHaveBeenCalledTimes(1);
    expect(component.loading()).toBe(true);

    loginSubject.next({
      token: 'token-123',
    });
    loginSubject.complete();

    expect(component.loading()).toBe(false);
    expect(routerMock.navigate).toHaveBeenCalledWith(['/']);
  });

  it('should login with the form credentials and navigate to home', () => {
    const fixture = TestBed.createComponent(Login);
    const component = fixture.componentInstance;

    component.form.setValue({
      username: 'admin',
      password: 'password',
    });

    expect(component.form.valid).toBe(true);
    expect(component.loginError()).toBe(false);

    component.submit();

    expect(authServiceMock.login).toHaveBeenCalledTimes(1);
    expect(authServiceMock.login).toHaveBeenCalledWith('admin', 'password');

    expect(component.loading()).toBe(false);
    expect(component.loginError()).toBe(false);

    expect(routerMock.navigate).toHaveBeenCalledTimes(1);
    expect(routerMock.navigate).toHaveBeenCalledWith(['/']);
  });

  it('should show a login error when authentication fails', () => {
    authServiceMock.login.mockReturnValue(
      throwError(() => new Error('Unauthorized')),
    );

    const fixture = TestBed.createComponent(Login);
    const component = fixture.componentInstance;

    component.form.setValue({
      username: 'admin',
      password: 'password',
    });

    expect(component.form.valid).toBe(true);
    expect(component.loginError()).toBe(false);

    component.submit();

    expect(authServiceMock.login).toHaveBeenCalledTimes(1);
    expect(authServiceMock.login).toHaveBeenCalledWith('admin', 'password');

    expect(component.loading()).toBe(false);
    expect(component.loginError()).toBe(true);

    expect(routerMock.navigate).not.toHaveBeenCalled();
  });

  it('should clear a previous login error when retrying authentication', () => {
    authServiceMock.login.mockReturnValue(
      throwError(() => new Error('Unauthorized')),
    );

    const fixture = TestBed.createComponent(Login);
    const component = fixture.componentInstance;

    component.form.setValue({
      username: 'admin',
      password: 'password',
    });

    component.submit();

    expect(component.loginError()).toBe(true);
    expect(component.loading()).toBe(false);
    expect(authServiceMock.login).toHaveBeenCalledTimes(1);

    const retrySubject = new Subject<{ token: string }>();

    authServiceMock.login.mockReturnValue(retrySubject.asObservable());

    component.submit();

    expect(authServiceMock.login).toHaveBeenCalledTimes(2);

    expect(component.loading()).toBe(true);
    expect(component.loginError()).toBe(false);

    expect(routerMock.navigate).not.toHaveBeenCalled();

    retrySubject.next({
      token: 'token-123',
    });
    retrySubject.complete();

    expect(component.loading()).toBe(false);
    expect(component.loginError()).toBe(false);

    expect(routerMock.navigate).toHaveBeenCalledWith(['/']);
  });
});
