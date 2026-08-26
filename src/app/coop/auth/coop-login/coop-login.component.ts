/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';

import { CoopAuthService } from '../../services/coop-auth.service';
import { CoopTokenService } from '../../services/coop-token.service';
@Component({
  selector: 'mifosx-coop-login',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    RouterLink
  ],
  templateUrl: './coop-login.component.html',
  styleUrl: './coop-login.component.scss'
})
export class CoopLoginComponent {
  private fb = inject(FormBuilder);
  private coopAuthService = inject(CoopAuthService);
  private router = inject(Router);
  private coopTokenService = inject(CoopTokenService);

  isSubmitting = false;

  successMessage = '';
  errorMessage = '';

  loginForm = this.fb.nonNullable.group({
    email: [
      '',
      [
        Validators.required,
        Validators.email
      ]
    ],

    password: [
      '',
      [
        Validators.required
      ]
    ]
  });

  onSubmit(): void {
    this.successMessage = '';
    this.errorMessage = '';

    /* =========================
       FORM VALIDATION
    ========================= */

    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();

      return;
    }

    const formValue = this.loginForm.getRawValue();

    this.isSubmitting = true;

    /* =========================
       LOGIN API
    ========================= */

    this.coopAuthService
      .login({
        email: formValue.email,
        password: formValue.password
      })
      .subscribe({
        next: (response) => {
          /* =========================
           VERIFIED USER
        ========================= */

          if (response.isEmailVerified === true && response.status === 'VERIFIED') {
            this.coopTokenService.setSession({
              accessToken: response.accessToken,
              refreshToken: response.refreshToken,
              tokenType: response.tokenType,
              expiresIn: response.expiresIn,
              status: response.status
            });

            this.isSubmitting = false;

            this.successMessage = 'Login successful. Redirecting...';

            /*
             * Go to profile page
             */

            setTimeout(() => {
              this.router.navigate([
                '/coop/profile'
              ]);
            }, 1000);

            return;
          }

          /* =========================
           UNVERIFIED USER
        =========================
         *
         * NOTE: as observed, the live API
         * currently always returns unverified
         * logins as an HTTP error (403), not
         * as a 200 response with this status
         * field. This branch is kept as a
         * defensive fallback in case the API
         * ever responds this way instead -
         * it shares the same handler as the
         * 403 case below, so there is nothing
         * to keep in sync if that changes.
         */

          if (response.status === 'UNVERIFIED') {
            this.handleUnverifiedUser(formValue.email);

            return;
          }

          /* =========================
           UNKNOWN STATUS
        ========================= */

          this.isSubmitting = false;

          this.errorMessage = 'Unable to determine your account status.';
        },

        /* =========================
         LOGIN API ERROR
      ========================= */

        error: (error) => {
          const serverError = error?.error?.error || error?.error?.message || error?.error?.defaultUserMessage || '';

          /* =================================
           EMAIL NOT VERIFIED (actual API
           behaviour: 403 with this message)
        ================================= */

          if (error.status === 403 && serverError.includes('Email not verified')) {
            this.handleUnverifiedUser(this.loginForm.getRawValue().email);

            return;
          }

          /* =================================
           OTHER LOGIN ERRORS
        ================================= */

          this.isSubmitting = false;

          this.errorMessage = serverError || 'Login failed. Please check your email and password.';
        }
      });
  }

  // =====================================================
  // HANDLE UNVERIFIED USER (shared by both code paths)
  // =====================================================

  /**
   * Resends the OTP for an unverified account and
   * navigates to the verify-email page on success.
   *
   * Called from both:
   * - the success handler, if the API ever returns
   *   200 with status: 'UNVERIFIED'
   * - the error handler, for the current 403
   *   "Email not verified" response
   *
   * so the resend/navigate logic only lives in one place.
   */
  private handleUnverifiedUser(email: string): void {
    /*
     * Keep loading while resend OTP
     * API is running.
     */

    this.isSubmitting = true;

    this.coopAuthService
      .resendOtp({
        email: email
      })
      .subscribe({
        /* =========================
         RESEND OTP SUCCESS
      ========================= */

        next: (resendResponse) => {
          this.isSubmitting = false;

          const userId = resendResponse.userId;

          /*
           * Make sure userId exists
           */

          if (!userId) {
            this.errorMessage = 'OTP was sent, but user ID was not returned.';

            return;
          }

          /*
           * Show backend message
           */

          this.successMessage = resendResponse.message || 'A new OTP has been sent to your email.';

          /*
           * Navigate to OTP page
           */

          setTimeout(() => {
            this.router.navigate(['/coop/verify-email'], {
              state: {
                userId: userId
              }
            });
          }, 1000);
        },

        /* =========================
         RESEND OTP ERROR
      ========================= */

        error: (error) => {
          this.isSubmitting = false;

          this.errorMessage =
            error?.error?.message ||
            error?.error?.error ||
            error?.error?.defaultUserMessage ||
            'Unable to resend OTP. Please try again.';
        }
      });
  }
}
