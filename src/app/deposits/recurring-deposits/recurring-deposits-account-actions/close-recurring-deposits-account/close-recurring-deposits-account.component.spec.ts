/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { TestBed } from '@angular/core/testing';
import { provideNativeDateAdapter } from '@angular/material/core';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { TranslateModule } from '@ngx-translate/core';
import { UntypedFormBuilder } from '@angular/forms';
import { ActivatedRoute, Router, provideRouter } from '@angular/router';
import { of } from 'rxjs';
import { Dates } from 'app/core/utils/dates';
import { RecurringDepositsService } from 'app/deposits/recurring-deposits/recurring-deposits.service';
import { SettingsService } from 'app/settings/settings.service';
import { CloseRecurringDepositsAccountComponent } from './close-recurring-deposits-account.component';

describe('CloseRecurringDepositsAccountComponent', () => {
  /** A business date behind the computer clock, as on a tenant whose close of business has not run yet. */
  const businessDate = new Date(2026, 9, 20);

  let recurringDepositsService: { executeRecurringDepositsAccountCommand: jest.Mock };
  let router: { navigate: jest.Mock };

  function createComponent(): CloseRecurringDepositsAccountComponent {
    recurringDepositsService = { executeRecurringDepositsAccountCommand: jest.fn(() => of({})) };
    router = { navigate: jest.fn() };
    TestBed.configureTestingModule({
      providers: [
        UntypedFormBuilder,
        { provide: RecurringDepositsService, useValue: recurringDepositsService },
        {
          provide: SettingsService,
          useValue: { businessDate, dateFormat: 'dd MMMM yyyy', language: { code: 'en' } }
        },
        { provide: Dates, useValue: { formatDate: jest.fn(() => '20 October 2026') } },
        { provide: Router, useValue: router },
        {
          provide: ActivatedRoute,
          useValue: {
            data: of({
              recurringDepositsAccountActionData: {
                savingsAccounts: [],
                maturityAmount: 1200,
                onAccountClosureOptions: [],
                paymentTypeOptions: []
              }
            }),
            parent: { snapshot: { params: { recurringDepositAccountId: '7' } } }
          }
        }
      ]
    });
    const component = TestBed.runInInjectionContext(() => new CloseRecurringDepositsAccountComponent());
    component.ngOnInit();
    return component;
  }

  it('starts the closure on the business date, the latest date the form accepts', () => {
    const component = createComponent();

    expect(component.maxDate).toBe(businessDate);
    expect(component.closeRecurringDepositForm.value.closedOnDate).toBe(businessDate);
    expect(component.closeRecurringDepositForm.controls.closedOnDate.valid).toBe(true);
  });

  it('does not close the account while the form is invalid', () => {
    const component = createComponent();

    component.submit();

    expect(recurringDepositsService.executeRecurringDepositsAccountCommand).not.toHaveBeenCalled();
    expect(router.navigate).not.toHaveBeenCalled();
  });

  it('closes the account once the required fields are filled', () => {
    const component = createComponent();
    component.closeRecurringDepositForm.patchValue({ onAccountClosureId: 100, paymentTypeId: 1 });

    component.submit();

    expect(recurringDepositsService.executeRecurringDepositsAccountCommand).toHaveBeenCalledWith(
      '7',
      'close',
      expect.objectContaining({ onAccountClosureId: 100, paymentTypeId: 1, locale: 'en' })
    );
  });

  it('keeps the Show Payment Details toggle from acting as the form submit button', async () => {
    await TestBed.configureTestingModule({
      imports: [
        CloseRecurringDepositsAccountComponent,
        TranslateModule.forRoot()
      ],
      providers: [
        provideRouter([]),
        provideNoopAnimations(),
        provideNativeDateAdapter(),
        {
          provide: RecurringDepositsService,
          useValue: { executeRecurringDepositsAccountCommand: jest.fn(() => of({})) }
        },
        {
          provide: SettingsService,
          useValue: { businessDate, dateFormat: 'dd MMMM yyyy', language: { code: 'en' } }
        },
        { provide: Dates, useValue: { formatDate: jest.fn() } },
        {
          provide: ActivatedRoute,
          useValue: {
            data: of({
              recurringDepositsAccountActionData: {
                savingsAccounts: [],
                maturityAmount: 1200,
                onAccountClosureOptions: [],
                paymentTypeOptions: []
              }
            }),
            parent: { snapshot: { params: { recurringDepositAccountId: '7' } } }
          }
        }
      ]
    }).compileComponents();
    const fixture = TestBed.createComponent(CloseRecurringDepositsAccountComponent);
    fixture.detectChanges();
    const toggle = (): HTMLButtonElement => fixture.nativeElement.querySelector('.expandcollapsebutton button');

    expect(toggle().type).toBe('button');

    fixture.componentInstance.toggleDisplay();
    fixture.detectChanges();

    expect(toggle().type).toBe('button');
  });
});
