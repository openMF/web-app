/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { firstValueFrom } from 'rxjs';
import { describe, expect, it } from '@jest/globals';

import { SavingsService } from './savings.service';

describe('SavingsService SINPE enrollment methods', () => {
  let service: SavingsService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        SavingsService,
        provideHttpClient(),
        provideHttpClientTesting()
      ]
    });

    service = TestBed.inject(SavingsService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('requests SINPE enrollment OTP using the v2 endpoint', async () => {
    const resultPromise = firstValueFrom(service.requestSinpeEnrollment(90, '88781923'));

    const req = httpMock.expectOne(
      (request) => request.url === '/v2/sinpe/enrollment/request' && request.method === 'POST'
    );
    expect(req.request.body).toEqual({
      clientId: 90,
      mobileNumber: '88781923'
    });
    req.flush({ sent: true });

    expect(await resultPromise).toEqual({ sent: true });
  });

  it('verifies a SINPE phone number without sending a GET body', async () => {
    const resultPromise = firstValueFrom(service.verifySinpeEnrollmentPhone('88781923'));

    const req = httpMock.expectOne(
      (request) => request.url === '/v2/sinpe/enrollment/phone/88781923' && request.method === 'GET'
    );
    expect(req.request.body).toBeNull();
    req.flush({ linked: false });

    expect(await resultPromise).toEqual({ linked: false });
  });

  it('gets linked SINPE phones for a savings account', async () => {
    const resultPromise = firstValueFrom(service.getLinkedSinpePhones(87));

    const req = httpMock.expectOne(
      (request) => request.url === '/v2/sinpe/enrollment/savingsaccounts/87/phones' && request.method === 'GET'
    );
    req.flush([
      {
        savingsAccountId: 87,
        iban: 'CR92037300110010000087',
        mobileNumber: '88781923',
        status: 'LINKED'
      }
    ]);

    expect(await resultPromise).toEqual([
      {
        savingsAccountId: 87,
        iban: 'CR92037300110010000087',
        mobileNumber: '88781923',
        status: 'LINKED'
      }
    ]);
  });

  it('creates a SINPE subscription with clientId, phoneNumber, iban, and otp', async () => {
    const payload = {
      clientId: 90,
      phoneNumber: '88781923',
      iban: 'CR92037300110010000087',
      otp: '048404'
    };
    const resultPromise = firstValueFrom(service.createSinpeSubscription(payload));

    const req = httpMock.expectOne(
      (request) => request.url === '/v2/sinpe/enrollment/subscription' && request.method === 'POST'
    );
    expect(req.request.body).toEqual(payload);
    req.flush({ resourceId: 1 });

    expect(await resultPromise).toEqual({ resourceId: 1 });
  });

  it('deletes a SINPE subscription with phone in the path and clientId plus otp in the body', async () => {
    const resultPromise = firstValueFrom(
      service.deleteSinpeSubscription('88781923', {
        clientId: 90,
        otp: '924892'
      })
    );

    const req = httpMock.expectOne(
      (request) => request.url === '/v2/sinpe/enrollment/subscription/88781923' && request.method === 'DELETE'
    );
    expect(req.request.body).toEqual({
      clientId: 90,
      otp: '924892'
    });
    req.flush({ resourceId: 1 });

    expect(await resultPromise).toEqual({ resourceId: 1 });
  });
});
