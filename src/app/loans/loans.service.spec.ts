/**
 * Copyright since 2026 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { Dates } from 'app/core/utils/dates';
import { SettingsService } from 'app/settings/settings.service';
import { LoansService } from './loans.service';
import { WorkingCapitalTransactionTemplateCommand } from './models/working-capital/working-capital-loan-account.model';
import { CreditOriginationBoard } from './models/credit-origination-board.model';

describe('LoansService - Working Capital transaction template', () => {
  const businessDate = new Date(2026, 0, 10);
  let service: LoansService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        LoansService,
        provideHttpClient(),
        provideHttpClientTesting(),
        {
          provide: SettingsService,
          useValue: { businessDate, dateFormat: 'dd MMMM yyyy', language: { code: 'en' } }
        },
        { provide: Dates, useValue: { formatDate: () => '10 January 2026' } }
      ]
    });
    service = TestBed.inject(LoansService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('gets the typed credit origination board from the WEB-1059 endpoint', () => {
    const board: CreditOriginationBoard = {
      creditApplicationId: 87,
      clientId: 90,
      loanId: 87,
      prospectId: null,
      currentStage: 'ONBOARDING',
      stages: []
    };

    service.getCreditOriginationBoard(87).subscribe((result) => expect(result).toEqual(board));
    const req = httpMock.expectOne('/v2/credit-applications/87/origination-board');

    expect(req.request.method).toBe('GET');
    req.flush(board);
  });

  /**
   * Issues the template request and returns the single outstanding HTTP request, so each test can assert on its params.
   * @param command The template command to request.
   * @returns The captured request.
   */
  function capture(command: WorkingCapitalTransactionTemplateCommand) {
    service.getWorkingCapitalLoanTransactionTemplate('1', command).subscribe();
    const req = httpMock.expectOne((r) => r.url === '/working-capital-loans/1/transactions/template');
    req.flush({});
    return req;
  }

  // The amount these quote comes from what the loan still owes, which is scoped to the date.
  it.each([
    'repayment',
    'goodwillCredit',
    'chargeOff',
    'prepayLoan'
  ])('sends the quote date for %s', (command) => {
    const req = capture(command as WorkingCapitalTransactionTemplateCommand);

    expect(req.request.params.get('transactionDate')).toBe('10 January 2026');
    expect(req.request.params.get('dateFormat')).toBe('dd MMMM yyyy');
    expect(req.request.params.get('locale')).toBe('en');
  });

  // creditBalanceRefund and recoveryPayment read what has been paid or recovered, which does not move with the date;
  // disburse quotes the approved principal; the discount commands quote no amount at all.
  it.each([
    'disburse',
    'creditBalanceRefund',
    'recoveryPayment',
    'discountFee',
    'discountFeeAdjustment'
  ])('sends no quote date for %s, whose amount cannot vary with it', (command) => {
    const req = capture(command as WorkingCapitalTransactionTemplateCommand);

    expect(req.request.params.get('transactionDate')).toBeNull();
    expect(req.request.params.get('command')).toBe(command);
  });

  it('prefers an explicit quote date over the business date', () => {
    service.getWorkingCapitalLoanTransactionTemplate('1', 'prepayLoan', '05 January 2026').subscribe();
    const req = httpMock.expectOne((r) => r.url === '/working-capital-loans/1/transactions/template');
    req.flush({});

    expect(req.request.params.get('transactionDate')).toBe('05 January 2026');
  });
});
