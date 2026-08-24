import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';

interface LoginRequest {
  username: string;
  password: string;
}

interface LoginResponse {
  token: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private readonly http = inject(HttpClient);

  private readonly loginUrl =
    '/api/v1/auth/login';

  private readonly tokenKey =
    'scm_access_token';

  login(
    username: string,
    password: string
  ): Observable<LoginResponse> {

    const request: LoginRequest = {
      username,
      password
    };

    return this.http
      .post<LoginResponse>(
        this.loginUrl,
        request
      )
      .pipe(
        tap(response =>
          this.storeToken(
            response.token
          )
        )
      );
  }

  logout(): void {

    localStorage.removeItem(
      this.tokenKey
    );
  }

  getToken(): string | null {

    return localStorage.getItem(
      this.tokenKey
    );
  }

  isAuthenticated(): boolean {

    return this.getToken() !== null;
  }

  private storeToken(
    token: string
  ): void {

    localStorage.setItem(
      this.tokenKey,
      token
    );
  }

}