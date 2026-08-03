/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

/** Angular Imports */
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, DestroyRef, OnInit, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { AbstractControl, FormBuilder, FormGroup, ValidationErrors, Validators } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { finalize, switchMap } from 'rxjs';

/** Angular Material Imports */
import { MatRadioModule } from '@angular/material/radio';
import { MatPrefix } from '@angular/material/form-field';

/** Custom Services */
import { SavingsService } from '../../savings.service';
import { STANDALONE_SHARED_IMPORTS } from 'app/standalone-shared.module';

export function normalizeFastPaymentPhoneNumber(value: unknown): string {
  const digits = `${value ?? ''}`.replace(/\D/g, '');
  return digits.length === 11 && digits.startsWith('506') ? digits.slice(3) : digits;
}

export function fastPaymentPhoneValidator(control: AbstractControl): ValidationErrors | null {
  return normalizeFastPaymentPhoneNumber(control.value).length === 8 ? null : { phoneNumber: true };
}

type FastPaymentLoadingAction = 'linkOtp' | 'link' | 'delinkOtp' | 'delink';
type FastPaymentStatusType = 'success' | 'error' | 'info';

/**
 * Link Payment System Component.
 */
@Component({
  selector: 'mifosx-link-payment-system',
  templateUrl: './link-payment-system.component.html',
  styleUrls: ['./link-payment-system.component.scss'],
  imports: [
    ...STANDALONE_SHARED_IMPORTS,
    MatRadioModule,
    MatPrefix,
    RouterLink
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LinkPaymentSystemComponent implements OnInit {
  private formBuilder = inject(FormBuilder);
  private route = inject(ActivatedRoute);
  private savingsService = inject(SavingsService);
  private changeDetectorRef = inject(ChangeDetectorRef);
  private destroyRef = inject(DestroyRef);

  savingsAccountData: any;
  linkPaymentSystemForm: FormGroup;
  delinkPaymentSystemForm: FormGroup;
  loadingAction: FastPaymentLoadingAction | null = null;
  otpRequested = false;
  delinkOtpRequested = false;
  linkedPhoneNumber: string | null = null;
  statusType: FastPaymentStatusType | null = null;
  statusMessage: string | null = null;
  statusDetail: string | null = null;

  constructor() {
    this.route.data.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((data: { savingsAccountActionData: any }) => {
      this.savingsAccountData = data.savingsAccountActionData;
    });
  }

  ngOnInit() {
    this.createForms();
    this.watchPhoneChanges();
    if (!this.iban) {
      this.setStatus('error', 'labels.text.Payment system account missing IBAN');
      this.linkPaymentSystemForm.disable();
    }
  }

  get iban(): string {
    return this.savingsAccountData?.externalId || '';
  }

  get clientId(): string | number | null {
    return this.savingsAccountData?.clientId || null;
  }

  get normalizedPhoneNumber(): string {
    return normalizeFastPaymentPhoneNumber(this.linkPaymentSystemForm.get('phoneNumber')?.value);
  }

  get isLoading(): boolean {
    return this.loadingAction !== null;
  }

  get canRequestLinkOtp(): boolean {
    return !this.isLoading && !!this.clientId && !!this.iban && this.linkPaymentSystemForm.get('phoneNumber')?.valid;
  }

  get canSubmitLink(): boolean {
    return (
      !this.isLoading &&
      this.otpRequested &&
      !!this.clientId &&
      !!this.iban &&
      this.linkPaymentSystemForm.get('phoneNumber')?.valid &&
      this.linkPaymentSystemForm.get('otp')?.valid
    );
  }

  get canRequestDelinkOtp(): boolean {
    return !this.isLoading && !!this.clientId && !!this.phoneNumberForDelink();
  }

  get canSubmitDelink(): boolean {
    return (
      !this.isLoading && this.delinkOtpRequested && this.delinkPaymentSystemForm.valid && !!this.phoneNumberForDelink()
    );
  }

  requestLinkOtp() {
    const clientId = this.clientId;
    if (!this.canRequestLinkOtp || clientId === null) {
      this.linkPaymentSystemForm.markAllAsTouched();
      return;
    }
    const phoneNumber = this.normalizedPhoneNumber;
    this.setLoading('linkOtp');
    this.savingsService
      .requestSinpeEnrollment(clientId, phoneNumber)
      .pipe(
        switchMap(() => this.savingsService.verifySinpeEnrollmentPhone(phoneNumber)),
        finalize(() => this.clearLoading())
      )
      .subscribe({
        next: () => {
          this.otpRequested = true;
          this.requireLinkOtp();
          this.setStatus('info', 'labels.text.Payment system OTP sent');
        },
        error: (error: any) => this.setStatus('error', 'labels.text.Payment system OTP request failed', error)
      });
  }

  submitLink() {
    const clientId = this.clientId;
    if (!this.canSubmitLink || clientId === null) {
      this.linkPaymentSystemForm.markAllAsTouched();
      return;
    }
    const phoneNumber = this.normalizedPhoneNumber;
    this.setLoading('link');
    this.savingsService
      .createSinpeSubscription({
        clientId: clientId,
        phoneNumber: phoneNumber,
        iban: this.iban,
        otp: this.linkPaymentSystemForm.get('otp')?.value
      })
      .pipe(finalize(() => this.clearLoading()))
      .subscribe({
        next: () => {
          this.linkedPhoneNumber = phoneNumber;
          this.otpRequested = false;
          this.linkPaymentSystemForm.get('otp')?.reset('');
          this.clearLinkOtpRequirement();
          this.setStatus('success', 'labels.text.Payment system link successful');
        },
        error: (error: any) => this.setStatus('error', 'labels.text.Payment system link failed', error)
      });
  }

  requestDelinkOtp() {
    const clientId = this.clientId;
    if (!this.canRequestDelinkOtp || clientId === null) {
      this.linkPaymentSystemForm.get('phoneNumber')?.markAsTouched();
      return;
    }
    const phoneNumber = this.phoneNumberForDelink();
    this.setLoading('delinkOtp');
    this.savingsService
      .requestSinpeEnrollment(clientId, phoneNumber)
      .pipe(finalize(() => this.clearLoading()))
      .subscribe({
        next: () => {
          this.delinkOtpRequested = true;
          this.delinkPaymentSystemForm.reset({ otp: '' });
          this.setStatus('info', 'labels.text.Payment system delink OTP sent');
        },
        error: (error: any) => this.setStatus('error', 'labels.text.Payment system delink OTP request failed', error)
      });
  }

  submitDelink() {
    const clientId = this.clientId;
    if (!this.canSubmitDelink || clientId === null) {
      this.delinkPaymentSystemForm.markAllAsTouched();
      return;
    }
    const phoneNumber = this.phoneNumberForDelink();
    this.setLoading('delink');
    this.savingsService
      .deleteSinpeSubscription(phoneNumber, {
        clientId: clientId,
        otp: this.delinkPaymentSystemForm.get('otp')?.value
      })
      .pipe(finalize(() => this.clearLoading()))
      .subscribe({
        next: () => {
          this.linkedPhoneNumber = null;
          this.delinkOtpRequested = false;
          this.delinkPaymentSystemForm.reset({ otp: '' });
          this.setStatus('success', 'labels.text.Payment system delink successful');
        },
        error: (error: any) => this.setStatus('error', 'labels.text.Payment system delink failed', error)
      });
  }

  private createForms() {
    this.linkPaymentSystemForm = this.formBuilder.group({
      accountToLink: [
        {
          value: this.iban,
          disabled: true
        }
      ],
      linkType: ['phone'],
      phoneNumber: [
        '',
        [
          Validators.required,
          fastPaymentPhoneValidator
        ]
      ],
      otp: ['']
    });
    this.delinkPaymentSystemForm = this.formBuilder.group({
      otp: [
        '',
        [
          Validators.required,
          Validators.pattern(/^[0-9]+$/)
        ]
      ]
    });
  }

  private watchPhoneChanges() {
    this.linkPaymentSystemForm
      .get('phoneNumber')
      ?.valueChanges.pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => {
        this.otpRequested = false;
        this.delinkOtpRequested = false;
        this.linkPaymentSystemForm.get('otp')?.reset('');
        this.delinkPaymentSystemForm.reset({ otp: '' });
        this.clearLinkOtpRequirement();
        this.statusType = null;
        this.statusMessage = null;
        this.statusDetail = null;
        this.changeDetectorRef.markForCheck();
      });
  }

  private requireLinkOtp() {
    const otpControl = this.linkPaymentSystemForm.get('otp');
    otpControl?.setValidators([
      Validators.required,
      Validators.pattern(/^[0-9]+$/)
    ]);
    otpControl?.updateValueAndValidity();
  }

  private clearLinkOtpRequirement() {
    const otpControl = this.linkPaymentSystemForm.get('otp');
    otpControl?.clearValidators();
    otpControl?.updateValueAndValidity();
  }

  private phoneNumberForDelink(): string {
    return (
      this.linkedPhoneNumber || (this.linkPaymentSystemForm.get('phoneNumber')?.valid ? this.normalizedPhoneNumber : '')
    );
  }

  private setLoading(action: FastPaymentLoadingAction) {
    this.loadingAction = action;
    this.statusType = null;
    this.statusMessage = null;
    this.statusDetail = null;
  }

  private clearLoading() {
    this.loadingAction = null;
    this.changeDetectorRef.markForCheck();
  }

  private setStatus(type: FastPaymentStatusType, message: string, error?: any) {
    this.statusType = type;
    this.statusMessage = message;
    this.statusDetail = this.errorMessage(error);
    this.changeDetectorRef.markForCheck();
  }

  private errorMessage(error: any): string | null {
    return error?.error?.defaultUserMessage || error?.error?.message || error?.message || error?.statusText || null;
  }
}
