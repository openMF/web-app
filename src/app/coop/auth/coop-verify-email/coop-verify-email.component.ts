/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';

import { Router } from '@angular/router';
import { CoopAuthService } from '../../services/coop-auth.service';

@Component({
  selector: 'mifosx-coop-verify-email',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './coop-verify-email.component.html',
  styleUrl: './coop-verify-email.component.scss'
})
export class CoopVerifyEmailComponent {
  private fb = inject(FormBuilder);
  private coopAuthService = inject(CoopAuthService);
  private router = inject(Router);

  isSubmitting = false;

  successMessage = '';
  errorMessage = '';

  /**
   * User ID used for email verification
   */
  userId: number | null = null;

  /**
   * OTP form
   */
  verifyForm = this.fb.nonNullable.group({
    otp: [
      '',
      [
        Validators.required,
        Validators.pattern(/^[0-9]{6}$/)
      ]
    ]
  });

  constructor() {
    const storedUserId = localStorage.getItem('coopVerificationUserId');

    this.userId = storedUserId ? Number(storedUserId) : null;

    console.log('Verify page userId from localStorage:', this.userId);
  }

  onSubmit(): void {
    this.successMessage = '';
    this.errorMessage = '';

    /* =========================
       FORM VALIDATION
    ========================= */

    if (this.verifyForm.invalid) {
      this.verifyForm.markAllAsTouched();

      return;
    }

    /* =========================
       CHECK USER ID
    ========================= */

    if (!this.userId) {
      this.errorMessage = 'Registration information was not found. Please register again.';

      return;
    }

    const otp = this.verifyForm.getRawValue().otp;

    console.log('Verifying user:', this.userId);

    console.log('OTP:', otp);

    this.isSubmitting = true;

    /* =========================
       VERIFY EMAIL API
    ========================= */

    this.coopAuthService
      .verifyEmail({
        userId: this.userId,
        otp: otp
      })
      .subscribe({
        /* =========================
         SUCCESS
      ========================= */

        next: (response) => {
          console.log('Email verification successful:', response);

          this.isSubmitting = false;

          /*
           * Remove temporary verification userId
           * after successful verification.
           */

          localStorage.removeItem('coopVerificationUserId');

          console.log('Verification userId removed from localStorage.');

          this.successMessage = response?.message || 'Email verified successfully. You can now log in.';

          /* =========================
           REDIRECT TO LOGIN
        ========================= */

          setTimeout(() => {
            console.log('Redirecting to Coop Login...');

            this.router.navigate([
              '/coop/login'
            ]);
          }, 1500);
        },

        /* =========================
         ERROR
      ========================= */

        error: (error) => {
          console.error('Email verification failed:', error);

          this.isSubmitting = false;

          this.errorMessage =
            error?.error?.message ||
            error?.error?.error ||
            error?.error?.defaultUserMessage ||
            'Invalid OTP. Please try again.';
        }
      });
  }
}
