/**
 * Copyright since 2026 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { TestBed } from '@angular/core/testing';
import { FormBuilder } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { of } from 'rxjs';
import { Dates } from 'app/core/utils/dates';
import { SavingsService } from 'app/savings/savings.service';
import { SettingsService } from 'app/settings/settings.service';
import { EditTransactionComponent } from './edit-transaction.component';

describe('Savings EditTransactionComponent', () => {
  /** A deposit as the savings transaction template endpoint returns it. */
  const depositTemplate = {
    id: 1,
    date: [
      2026,
      6,
      1
    ],
    amount: 500,
    // Fineract returns the payment type only inside paymentDetailData, never as a flat paymentTypeId.
    paymentDetailData: { id: 3, paymentType: { id: 4, name: 'Cash' } },
    currency: { code: 'USD', displaySymbol: '$' },
    paymentTypeOptions: [{ id: 4, name: 'Cash' }]
  };

  function createComponent(template: any = depositTemplate): EditTransactionComponent {
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      providers: [
        FormBuilder,
        {
          provide: ActivatedRoute,
          useValue: {
            data: of({ savingsAccountTransactionTemplate: template }),
            snapshot: { params: { savingAccountId: '1' } }
          }
        },
        { provide: Router, useValue: { navigate: jest.fn() } },
        {
          provide: SavingsService,
          useValue: { executeSavingsAccountTransactionsCommand: jest.fn().mockReturnValue(of({})) }
        },
        {
          provide: SettingsService,
          useValue: { businessDate: new Date(2026, 5, 10), dateFormat: 'dd MMMM yyyy', language: { code: 'en' } }
        },
        {
          provide: Dates,
          useValue: {
            parseDate: (value: number[]) => new Date(value[0], value[1] - 1, value[2]),
            formatDate: () => '01 June 2026'
          }
        }
      ]
    });
    const component = TestBed.runInInjectionContext(() => new EditTransactionComponent());
    component.ngOnInit();
    return component;
  }

  it('prefills the payment type from the payment detail of the transaction', () => {
    const component = createComponent();

    expect(component.editTransactionForm.controls.paymentTypeId.value).toBe(4);
    expect(component.editTransactionForm.controls.transactionAmount.value).toBe(500);
  });

  it('leaves the payment type empty when the transaction has no payment detail', () => {
    const component = createComponent({ ...depositTemplate, paymentDetailData: null });

    expect(component.editTransactionForm.controls.paymentTypeId.value).toBe('');
  });
});
