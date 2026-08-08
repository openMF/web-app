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
import { finalize, map, switchMap } from 'rxjs';

/** Angular Material Imports */
import { MatRadioModule } from '@angular/material/radio';
import { MatPrefix } from '@angular/material/form-field';
import { MatTableModule } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';

/** Custom Services */
import { SavingsService, SinpeLinkedPhone } from '../../savings.service';
import { STANDALONE_SHARED_IMPORTS } from 'app/standalone-shared.module';

export function normalizeFastPaymentPhoneNumber(value: unknown): string {
  const digits = `${value ?? ''}`.replace(/\D/g, '');
  return digits.length === 11 && digits.startsWith('506') ? digits.slice(3) : digits;
}

export function fastPaymentPhoneValidator(control: AbstractControl): ValidationErrors | null {
  return normalizeFastPaymentPhoneNumber(control.value).length === 8 ? null : { phoneNumber: true };
}

export function otpFromEnrollmentRequestResponse(response: any): string {
  const otp = response?.changes?.otp;
  return otp === null || otp === undefined ? '' : `${otp}`;
}

type FastPaymentView = 'LIST' | 'ADD' | 'REMOVE';
type FastPaymentLoadingAction = 'list' | 'linkOtp' | 'link' | 'delinkOtp' | 'delink';
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
    MatTableModule,
    MatIconModule,
    MatTooltipModule,
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
  viewMode: FastPaymentView = 'LIST';
  displayedColumns = [
    'iban',
    'status',
    'mobileNumber',
    'actions'
  ];
  linkedPhones: SinpeLinkedPhone[] = [];
  selectedLink: SinpeLinkedPhone | null = null;
  loadingAction: FastPaymentLoadingAction | null = null;
  otpRequested = false;
  delinkOtpRequested = false;
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
    this.loadLinkedPhones();
  }

  get savingsAccountId(): string | number | null {
    return this.savingsAccountData?.id ?? this.route.snapshot.params?.savingAccountId ?? null;
  }

  get iban(): string {
    return this.savingsAccountData?.externalId || '';
  }

  get clientId(): string | number | null {
    return this.savingsAccountData?.clientId ?? null;
  }

  get normalizedPhoneNumber(): string {
    return normalizeFastPaymentPhoneNumber(this.linkPaymentSystemForm.get('phoneNumber')?.value);
  }

  get isLoading(): boolean {
    return this.loadingAction !== null;
  }

  get canRequestLinkOtp(): boolean {
    return (
      this.viewMode === 'ADD' &&
      !this.isLoading &&
      !!this.clientId &&
      !!this.iban &&
      this.linkPaymentSystemForm.get('phoneNumber')?.valid
    );
  }

  get canSubmitLink(): boolean {
    return (
      !this.isLoading &&
      this.viewMode === 'ADD' &&
      this.otpRequested &&
      !!this.clientId &&
      !!this.iban &&
      this.linkPaymentSystemForm.get('phoneNumber')?.valid &&
      this.linkPaymentSystemForm.get('otp')?.valid
    );
  }

  get canRequestDelinkOtp(): boolean {
    return this.viewMode === 'REMOVE' && !this.isLoading && !!this.clientId && !!this.phoneNumberForDelink();
  }

  get canSubmitDelink(): boolean {
    return (
      !this.isLoading &&
      this.viewMode === 'REMOVE' &&
      this.delinkOtpRequested &&
      this.delinkPaymentSystemForm.valid &&
      !!this.phoneNumberForDelink()
    );
  }

  loadLinkedPhones(successMessage?: string) {
    const savingsAccountId = this.savingsAccountId;
    if (savingsAccountId === null) {
      this.linkedPhones = [];
      return;
    }

    this.setLoading('list', !successMessage);
    this.savingsService
      .getLinkedSinpePhones(savingsAccountId)
      .pipe(finalize(() => this.clearLoading()))
      .subscribe({
        next: (linkedPhones: SinpeLinkedPhone[]) => {
          this.linkedPhones = linkedPhones || [];
          this.viewMode = 'LIST';
          this.selectedLink = null;
          this.delinkOtpRequested = false;
          if (successMessage) {
            this.setStatus('success', successMessage);
          }
        },
        error: (error: any) => this.setStatus('error', 'labels.text.Payment system links loading failed', error)
      });
  }

  showAddView() {
    this.viewMode = 'ADD';
    this.selectedLink = null;
    this.otpRequested = false;
    this.delinkOtpRequested = false;
    this.clearOtpValues();
    this.clearStatus();
    this.resetLinkForm();
    if (!this.iban) {
      this.setStatus('error', 'labels.text.Payment system account missing IBAN');
    }
  }

  showListView() {
    this.viewMode = 'LIST';
    this.selectedLink = null;
    this.otpRequested = false;
    this.delinkOtpRequested = false;
    this.clearOtpValues();
    this.clearStatus();
  }

  showRemoveView(linkedPhone: SinpeLinkedPhone) {
    this.viewMode = 'REMOVE';
    this.selectedLink = linkedPhone;
    this.otpRequested = false;
    this.delinkOtpRequested = false;
    this.clearStatus();
    this.delinkPaymentSystemForm.reset({
      accountToLink: linkedPhone.iban || '',
      phoneNumber: normalizeFastPaymentPhoneNumber(linkedPhone.mobileNumber),
      otp: ''
    });
    this.requestDelinkOtp();
  }

  requestLinkOtp() {
    const clientId = this.clientId;
    if (!this.canRequestLinkOtp || clientId === null) {
      this.linkPaymentSystemForm.markAllAsTouched();
      return;
    }
    const phoneNumber = this.normalizedPhoneNumber;
    this.linkPaymentSystemForm.get('otp')?.reset('');
    this.setLoading('linkOtp');
    this.savingsService
      .requestSinpeEnrollment(clientId, phoneNumber)
      .pipe(
        switchMap((response: any) =>
          this.savingsService.verifySinpeEnrollmentPhone(phoneNumber).pipe(map(() => response))
        ),
        finalize(() => this.clearLoading())
      )
      .subscribe({
        next: (response: any) => {
          this.otpRequested = true;
          this.requireLinkOtp();
          this.prefillOtp(this.linkPaymentSystemForm, response);
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
      .subscribe({
        next: () => {
          this.otpRequested = false;
          this.clearOtpValues();
          this.clearLinkOtpRequirement();
          this.loadLinkedPhones('labels.text.Payment system link successful');
        },
        error: (error: any) => {
          this.clearLoading();
          this.setStatus('error', 'labels.text.Payment system link failed', error);
        }
      });
  }

  requestDelinkOtp() {
    const clientId = this.clientId;
    if (!this.canRequestDelinkOtp || clientId === null) {
      this.delinkPaymentSystemForm.markAllAsTouched();
      return;
    }
    const phoneNumber = this.phoneNumberForDelink();
    this.setLoading('delinkOtp');
    this.delinkPaymentSystemForm.get('otp')?.reset('');
    this.savingsService
      .requestSinpeEnrollment(clientId, phoneNumber)
      .pipe(finalize(() => this.clearLoading()))
      .subscribe({
        next: (response: any) => {
          this.delinkOtpRequested = true;
          this.prefillOtp(this.delinkPaymentSystemForm, response);
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
      .subscribe({
        next: () => {
          this.delinkOtpRequested = false;
          this.clearOtpValues();
          this.loadLinkedPhones('labels.text.Payment system delink successful');
        },
        error: (error: any) => {
          this.clearLoading();
          this.setStatus('error', 'labels.text.Payment system delink failed', error);
        }
      });
  }

  clearOtpValues() {
    this.linkPaymentSystemForm.get('otp')?.reset('');
    this.delinkPaymentSystemForm.get('otp')?.reset('');
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
      accountToLink: [
        {
          value: '',
          disabled: true
        }
      ],
      phoneNumber: [
        {
          value: '',
          disabled: true
        }
      ],
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
        this.clearOtpValues();
        this.clearLinkOtpRequirement();
        this.statusType = null;
        this.statusMessage = null;
        this.statusDetail = null;
        this.changeDetectorRef.markForCheck();
      });
  }

  private resetLinkForm() {
    this.linkPaymentSystemForm.reset({
      accountToLink: this.iban,
      linkType: 'phone',
      phoneNumber: '',
      otp: ''
    });
    this.linkPaymentSystemForm.enable();
    this.linkPaymentSystemForm.get('accountToLink')?.disable();
    if (!this.iban) {
      this.linkPaymentSystemForm.disable();
    }
    this.clearLinkOtpRequirement();
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
    return normalizeFastPaymentPhoneNumber(this.selectedLink?.mobileNumber);
  }

  private prefillOtp(form: FormGroup, response: any) {
    const otp = otpFromEnrollmentRequestResponse(response);
    if (otp) {
      form.get('otp')?.setValue(otp);
    }
  }

  private setLoading(action: FastPaymentLoadingAction, clearStatus = true) {
    this.loadingAction = action;
    if (clearStatus) {
      this.clearStatus();
    }
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

  private clearStatus() {
    this.statusType = null;
    this.statusMessage = null;
    this.statusDetail = null;
    this.changeDetectorRef.markForCheck();
  }

  private errorMessage(error: any): string | null {
    return error?.error?.defaultUserMessage || error?.error?.message || error?.message || error?.statusText || null;
  }
}
