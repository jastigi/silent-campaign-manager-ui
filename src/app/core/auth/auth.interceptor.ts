import { HttpInterceptorFn } from '@angular/common/http';

import { inject } from '@angular/core';

import { AuthService } from './auth.service';

export const authInterceptor: HttpInterceptorFn = (request, next) => {
  const authService = inject(AuthService);

  const isLoginRequest = request.url.includes('/api/v1/auth/login');

  if (isLoginRequest) {
    return next(request);
  }

  const token = authService.getToken();

  if (!token) {
    return next(request);
  }

  const authenticatedRequest = request.clone({
    setHeaders: {
      Authorization: `Bearer ${token}`,
    },
  });

  return next(authenticatedRequest);
};
