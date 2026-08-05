/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, provideRouter } from '@angular/router';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { TranslateModule } from '@ngx-translate/core';
import { of, throwError } from 'rxjs';
import { describe, expect, it, jest } from '@jest/globals';

import { SavingsService } from 'app/savings/savings.service';
import {
  fastPaymentPhoneValidator,
  LinkPaymentSystemComponent,
  normalizeFastPaymentPhoneNumber,
  otpFromEnrollmentRequestResponse
} from './link-payment-system.component';

describe('LinkPaymentSystemComponent', () => {
  let component: LinkPaymentSystemComponent;
  let fixture: ComponentFixture<LinkPaymentSystemComponent>;
  let savingsService: {
    requestSinpeEnrollment: jest.Mock;
    verifySinpeEnrollmentPhone: jest.Mock;
    createSinpeSubscription: jest.Mock;
    deleteSinpeSubscription: jest.Mock;
  };

  const setup = async (savingsAccountActionData: any = {}) => {
    savingsService = {
      requestSinpeEnrollment: jest.fn(() => of({})),
      verifySinpeEnrollmentPhone: jest.fn(() => of({})),
      createSinpeSubscription: jest.fn(() => of({})),
      deleteSinpeSubscription: jest.fn(() => of({}))
    };

    await TestBed.configureTestingModule({
      imports: [
        LinkPaymentSystemComponent,
        TranslateModule.forRoot()
      ],
      providers: [
        provideRouter([]),
        {
          provide: ActivatedRoute,
          useValue: {
            data: of({
              savingsAccountActionData: {
                id: 87,
                clientId: 90,
                accountNo: '00000087',
                externalId: 'CR92037300110010000087',
                ...savingsAccountActionData
              }
            }),
            snapshot: {
              params: {
                savingAccountId: '87',
                name: 'Link to payment system'
              }
            }
          }
        },
        {
          provide: SavingsService,
          useValue: savingsService
        },
        provideAnimationsAsync()
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(LinkPaymentSystemComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  };

  it('normalizes Costa Rica phone numbers to the 8 digit value sent to the API', () => {
    expect(normalizeFastPaymentPhoneNumber('+506 0930 0097')).toBe('09300097');
    expect(normalizeFastPaymentPhoneNumber('88781923')).toBe('88781923');
    expect(normalizeFastPaymentPhoneNumber('50688781923')).toBe('88781923');
  });

  it('validates normalized phone numbers', () => {
    expect(fastPaymentPhoneValidator({ value: '+506 0930 0097' } as any)).toBeNull();
    expect(fastPaymentPhoneValidator({ value: '1234567' } as any)).toEqual({ phoneNumber: true });
  });

  it('extracts OTP from the enrollment request response changes', () => {
    expect(otpFromEnrollmentRequestResponse({ changes: { otp: '048404' } })).toBe('048404');
    expect(otpFromEnrollmentRequestResponse({ changes: { otp: 924892 } })).toBe('924892');
    expect(otpFromEnrollmentRequestResponse({ changes: {} })).toBe('');
    expect(otpFromEnrollmentRequestResponse({})).toBe('');
  });

  it('uses savings externalId as the read-only IBAN and never accountNo', async () => {
    await setup();

    expect(component.linkPaymentSystemForm.getRawValue().accountToLink).toBe('CR92037300110010000087');
    expect(component.linkPaymentSystemForm.get('accountToLink')?.disabled).toBe(true);
    expect(component.linkPaymentSystemForm.getRawValue().accountToLink).not.toBe('00000087');
  });

  it('requests OTP, verifies the phone, and links with externalId as iban', async () => {
    await setup();
    savingsService.requestSinpeEnrollment.mockReturnValueOnce(of({ changes: { otp: '048404' } }));

    component.linkPaymentSystemForm.patchValue({ phoneNumber: '+506 0930 0097' });
    component.requestLinkOtp();

    expect(savingsService.requestSinpeEnrollment).toHaveBeenCalledWith(90, '09300097');
    expect(savingsService.verifySinpeEnrollmentPhone).toHaveBeenCalledWith('09300097');
    expect(component.otpRequested).toBe(true);
    expect(component.linkPaymentSystemForm.get('otp')?.value).toBe('048404');

    component.linkPaymentSystemForm.patchValue({ otp: '048404' });
    component.submitLink();

    expect(savingsService.createSinpeSubscription).toHaveBeenCalledWith({
      clientId: 90,
      phoneNumber: '09300097',
      iban: 'CR92037300110010000087',
      otp: '048404'
    });
    expect(component.linkedPhoneNumber).toBe('09300097');
    expect(component.statusType).toBe('success');
    expect(component.linkPaymentSystemForm.get('otp')?.value).toBe('');
  });

  it('keeps manual OTP entry available when the backend does not return an OTP', async () => {
    await setup();
    savingsService.requestSinpeEnrollment.mockReturnValueOnce(of({ changes: {} }));

    component.linkPaymentSystemForm.patchValue({ phoneNumber: '88781923', otp: '999999' });
    component.requestLinkOtp();

    expect(component.otpRequested).toBe(true);
    expect(component.linkPaymentSystemForm.get('otp')?.value).toBe('');

    component.linkPaymentSystemForm.patchValue({ otp: '123456' });
    component.submitLink();

    expect(savingsService.createSinpeSubscription).toHaveBeenCalledWith({
      clientId: 90,
      phoneNumber: '88781923',
      iban: 'CR92037300110010000087',
      otp: '123456'
    });
  });

  it('clears returned OTP values when the phone number changes', async () => {
    await setup();
    savingsService.requestSinpeEnrollment.mockReturnValueOnce(of({ changes: { otp: '048404' } }));

    component.linkPaymentSystemForm.patchValue({ phoneNumber: '88781923' });
    component.requestLinkOtp();
    component.delinkPaymentSystemForm.patchValue({ otp: '924892' });

    component.linkPaymentSystemForm.patchValue({ phoneNumber: '88781924' });

    expect(component.linkPaymentSystemForm.get('otp')?.value).toBe('');
    expect(component.delinkPaymentSystemForm.get('otp')?.value).toBe('');
    expect(component.otpRequested).toBe(false);
    expect(component.delinkOtpRequested).toBe(false);
  });

  it('shows an error state when link OTP request fails', async () => {
    await setup();
    savingsService.requestSinpeEnrollment.mockReturnValueOnce(
      throwError(() => ({ error: { message: 'Invalid phone' } }))
    );

    component.linkPaymentSystemForm.patchValue({ phoneNumber: '88781923' });
    component.requestLinkOtp();

    expect(component.statusType).toBe('error');
    expect(component.statusMessage).toBe('labels.text.Payment system OTP request failed');
    expect(component.statusDetail).toBe('Invalid phone');
  });

  it('shows an error state when link submit fails', async () => {
    await setup();
    savingsService.createSinpeSubscription.mockReturnValueOnce(
      throwError(() => ({ error: { message: 'Invalid OTP' } }))
    );

    component.linkPaymentSystemForm.patchValue({ phoneNumber: '88781923' });
    component.requestLinkOtp();
    component.linkPaymentSystemForm.patchValue({ otp: '123456' });
    component.submitLink();

    expect(component.statusType).toBe('error');
    expect(component.statusMessage).toBe('labels.text.Payment system link failed');
    expect(component.statusDetail).toBe('Invalid OTP');
  });

  it('requests a fresh OTP and delinks the linked phone number', async () => {
    await setup();
    savingsService.requestSinpeEnrollment.mockReturnValueOnce(of({ changes: { otp: '924892' } }));
    component.linkedPhoneNumber = '88781923';

    component.requestDelinkOtp();

    expect(savingsService.requestSinpeEnrollment).toHaveBeenCalledWith(90, '88781923');
    expect(component.delinkOtpRequested).toBe(true);
    expect(component.delinkPaymentSystemForm.get('otp')?.value).toBe('924892');

    component.delinkPaymentSystemForm.patchValue({ otp: '924892' });
    component.submitDelink();

    expect(savingsService.deleteSinpeSubscription).toHaveBeenCalledWith('88781923', {
      clientId: 90,
      otp: '924892'
    });
    expect(component.linkedPhoneNumber).toBeNull();
    expect(component.statusType).toBe('success');
    expect(component.delinkPaymentSystemForm.get('otp')?.value).toBe('');
  });

  it('shows an error state when delink fails', async () => {
    await setup();
    savingsService.deleteSinpeSubscription.mockReturnValueOnce(
      throwError(() => ({ error: { defaultUserMessage: 'OTP expired' } }))
    );
    component.linkedPhoneNumber = '88781923';
    component.delinkOtpRequested = true;
    component.delinkPaymentSystemForm.patchValue({ otp: '924892' });

    component.submitDelink();

    expect(component.statusType).toBe('error');
    expect(component.statusMessage).toBe('labels.text.Payment system delink failed');
    expect(component.statusDetail).toBe('OTP expired');
  });
});
