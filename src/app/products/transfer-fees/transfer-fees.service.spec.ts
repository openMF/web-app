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

import { TransferFeePayload } from './models/transfer-fee.model';
import { TransferFeesService } from './transfer-fees.service';

describe('TransferFeesService', () => {
  let service: TransferFeesService;
  let httpMock: HttpTestingController;

  const payload: TransferFeePayload = {
    transferType: 'PIN',
    currencyCode: 'CRC',
    transferMode: 'INMEDIATA',
    feeType: 'FIXED',
    feeValue: '10.50',
    feeCurrency: 'CRC',
    thresholdAmount: null,
    thresholdFeeValue: null,
    description: null,
    isActive: true,
    exchangeRateRequired: false
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        TransferFeesService,
        provideHttpClient(),
        provideHttpClientTesting()
      ]
    });

    service = TestBed.inject(TransferFeesService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should fetch transfer fees from the Self-Service Plugin endpoint', async () => {
    const resultPromise = firstValueFrom(service.getTransferFees());

    const req = httpMock.expectOne((request) => request.url === '/v1/self/transfer-fees' && request.method === 'GET');
    req.flush([{ id: 1 }]);

    expect(await resultPromise).toEqual([{ id: 1 }]);
  });

  it('should create a transfer fee with the supported payload', async () => {
    const resultPromise = firstValueFrom(service.createTransferFee(payload));

    const req = httpMock.expectOne((request) => request.url === '/v1/self/transfer-fees' && request.method === 'POST');
    expect(req.request.body).toEqual(payload);
    req.flush({ resourceId: 1 });

    expect(await resultPromise).toEqual({ resourceId: 1 });
  });

  it('should update a transfer fee with the supported payload', async () => {
    const resultPromise = firstValueFrom(service.updateTransferFee(7, payload));

    const req = httpMock.expectOne((request) => request.url === '/v1/self/transfer-fees/7' && request.method === 'PUT');
    expect(req.request.body).toEqual(payload);
    req.flush({ resourceId: 7 });

    expect(await resultPromise).toEqual({ resourceId: 7 });
  });

  it('should delete a transfer fee by id', async () => {
    const resultPromise = firstValueFrom(service.deleteTransferFee(9));

    const req = httpMock.expectOne(
      (request) => request.url === '/v1/self/transfer-fees/9' && request.method === 'DELETE'
    );
    req.flush({ resourceId: 9 });

    expect(await resultPromise).toEqual({ resourceId: 9 });
  });

  it('should find one transfer fee from the supported list endpoint', async () => {
    const resultPromise = firstValueFrom(service.getTransferFee('2'));

    const req = httpMock.expectOne((request) => request.url === '/v1/self/transfer-fees' && request.method === 'GET');
    req.flush([
      { id: 1, transferType: 'PIN' },
      { id: 2, transferType: 'SINPE_MOVIL' }
    ]);

    expect(await resultPromise).toEqual({ id: 2, transferType: 'SINPE_MOVIL' });
  });

  it('should reject with a 404 when the transfer fee is not found in the list response', async () => {
    const resultPromise = firstValueFrom(service.getTransferFee(99));

    const req = httpMock.expectOne((request) => request.url === '/v1/self/transfer-fees' && request.method === 'GET');
    req.flush([{ id: 1, transferType: 'PIN' }]);

    await expect(resultPromise).rejects.toEqual(expect.objectContaining({ status: 404 }));
  });
});
