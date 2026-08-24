import {
  Component,
  inject,
  signal
} from '@angular/core';

import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';

import {
  Router
} from '@angular/router';

import {
  MatButtonModule
} from '@angular/material/button';

import {
  MatCardModule
} from '@angular/material/card';

import {
  MatFormFieldModule
} from '@angular/material/form-field';

import {
  MatInputModule
} from '@angular/material/input';

import {
  AuthService
} from '../../../../core/auth/auth.service';

@Component({
  selector: 'app-login',
  imports: [
    ReactiveFormsModule,
    MatButtonModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule
  ],
  templateUrl: './login.html',
  styleUrl: './login.scss'
})
export class Login {

  private readonly authService =
    inject(AuthService);

  private readonly router =
    inject(Router);

  readonly loading =
    signal(false);

  readonly loginError =
    signal(false);

  readonly form =
    new FormGroup({
      username:
        new FormControl(
          '',
          {
            nonNullable: true,
            validators: [
              Validators.required
            ]
          }
        ),

      password:
        new FormControl(
          '',
          {
            nonNullable: true,
            validators: [
              Validators.required
            ]
          }
        )
    });

  submit(): void {

    if (
      this.form.invalid ||
      this.loading()
    ) {

      this.form.markAllAsTouched();

      return;
    }

    this.loading.set(true);
    this.loginError.set(false);

    const {
      username,
      password
    } =
      this.form.getRawValue();

    this.authService
      .login(
        username,
        password
      )
      .subscribe({
        next: () => {

          this.loading.set(false);

          this.router.navigate([
            '/'
          ]);
        },

        error: () => {

          this.loading.set(false);
          this.loginError.set(true);
        }
      });
  }

}