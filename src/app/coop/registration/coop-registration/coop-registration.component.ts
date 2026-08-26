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

@Component({
  selector: 'mifosx-coop-registration',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    RouterLink
  ],
  templateUrl: './coop-registration.component.html',
  styleUrl: './coop-registration.component.scss'
})
export class CoopRegistrationComponent {
  private fb = inject(FormBuilder);
  private coopAuthService = inject(CoopAuthService);
  private router = inject(Router);

  isSubmitting = false;
  successMessage = '';
  errorMessage = '';

  registrationForm = this.fb.nonNullable.group({
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
        Validators.required,
        Validators.minLength(8)
      ]
    ],

    phone: [
      '',
      [
        Validators.required,
        Validators.pattern(/^[0-9]{10}$/)
      ]
    ]
  });

  onSubmit(): void {
    this.successMessage = '';
    this.errorMessage = '';

    if (this.registrationForm.invalid) {
      this.registrationForm.markAllAsTouched();
      return;
    }

    const formValue = this.registrationForm.getRawValue();

    this.isSubmitting = true;

    this.coopAuthService
      .register({
        email: formValue.email,
        password: formValue.password,
        phone: formValue.phone
      })
      .subscribe({
        next: (response) => {
          console.log('Registration successful:', response);

          this.isSubmitting = false;

          // IMPORTANT
          const userId = response.userId;

          console.log('User ID received:', userId);

          if (!userId) {
            this.errorMessage = 'Registration succeeded but user ID was not returned.';
            return;
          }

          // Store userId for email verification
          localStorage.setItem('coopVerificationUserId', userId.toString());
          console.log('Verification userId stored:', localStorage.getItem('coopVerificationUserId'));
          // Go to OTP verification page
          this.router.navigate(['/coop/verify-email']);
        },

        error: (error) => {
          console.error('Registration failed:', error);
          this.isSubmitting = false;

          //Extracting the error details or console message coming from the backend
          const serverError = error?.error?.error || error?.error?.message || '';
          console.log('Extracted server error message context:', serverError);

          //if email is already verified
          if (serverError.includes('status: VERIFIED') || serverError.includes('already registered')) {
            // error message for user
            this.errorMessage = 'This email already exists and is verified. Please log in.';
            this.registrationForm.controls.email.setErrors({ alreadyExists: true });
          } else {
            //other errors
            this.errorMessage =
              serverError || 'Registration failed. Please check your inputs or network and try again.';
          }
        }
      });
  }
}
