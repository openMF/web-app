/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { describe, it, expect, beforeEach, afterEach } from '@jest/globals';

import { AccountTransfersService } from './account-transfers.service';

describe('AccountTransfersService', () => {
  let service: AccountTransfersService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        AccountTransfersService,
        provideHttpClient(),
        provideHttpClientTesting()
      ]
    });
    service = TestBed.inject(AccountTransfersService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('deletes a standing instruction with PUT ?command=delete', () => {
    let response: any;
    service.deleteStandingInstrucions(7).subscribe((r) => (response = r));

    const req = httpMock.expectOne((r) => r.url === '/standinginstructions/7' && r.params.get('command') === 'delete');
    expect(req.request.method).toBe('PUT');
    req.flush({ resourceId: 7, changes: { status: 3 } });

    expect(response).toEqual({ resourceId: 7, changes: { status: 3 } });
  });
});
