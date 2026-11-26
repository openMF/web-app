/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideNativeDateAdapter } from '@angular/material/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { TranslateModule } from '@ngx-translate/core';
import { BehaviorSubject } from 'rxjs';
import { CreditFilterDialogComponent } from './credit-filter-dialog.component';
import {
  CreditCurrencyOption,
  CreditCurrencyState,
  CreditFilterDialogData,
  CreditFilterPatch
} from './credit-filter-dialog.model';

describe('CreditFilterDialogComponent', () => {
  let fixture: ComponentFixture<CreditFilterDialogComponent>;
  let currencies: BehaviorSubject<CreditCurrencyState>;
  let close: jest.Mock;
  let retry: jest.Mock;
  beforeEach(() => {
    currencies = new BehaviorSubject<CreditCurrencyState>({ options: [], loading: true, failed: false });
    close = jest.fn();
    retry = jest.fn();
    const data: CreditFilterDialogData = {
      kind: 'amount',
      value: {},
      states: [],
      currencies$: currencies,
      retryCurrencies: retry
    };
    TestBed.configureTestingModule({
      imports: [
        CreditFilterDialogComponent,
        TranslateModule.forRoot(),
        NoopAnimationsModule
      ],
      providers: [
        provideNativeDateAdapter(),
        { provide: MAT_DIALOG_DATA, useValue: data },
        { provide: MatDialogRef, useValue: { close } }
      ]
    });
    fixture = TestBed.createComponent(CreditFilterDialogComponent);
    fixture.detectChanges();
  });
  it('updates an already-open amount dialog when currencies finish loading', () => {
    expect(fixture.nativeElement.textContent).toContain('credits.currencyLoading');
    currencies.next({ options: [{ code: 'USD', name: 'US Dollar' }], loading: false, failed: false });
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).not.toContain('credits.currencyLoading');
    fixture.componentInstance.form.patchValue({ minAmount: '100.00000001', currencyCode: 'USD' });
    fixture.componentInstance.apply();
    expect(close).toHaveBeenCalledWith({ minAmount: '100.00000001', maxAmount: null, currencyCode: 'USD' });
  });
  it('keeps a retry available after failure and can apply without reopening', () => {
    currencies.next({ options: [], loading: false, failed: true });
    fixture.detectChanges();
    const button = Array.from(fixture.nativeElement.querySelectorAll('button')).find((node: HTMLButtonElement) =>
      node.textContent.includes('labels.buttons.Retry')
    ) as HTMLButtonElement;
    button.click();
    expect(retry).toHaveBeenCalledTimes(1);
    currencies.next({ options: [{ code: 'JPY', name: 'Yen' }], loading: false, failed: false });
    fixture.detectChanges();
    fixture.componentInstance.form.patchValue({ maxAmount: '1234', currencyCode: 'JPY' });
    fixture.componentInstance.apply();
    expect(close).toHaveBeenCalledWith({ minAmount: null, maxAmount: '1234', currencyCode: 'JPY' });
  });
  it('rejects an unsupported currency and returns only fields belonging to the dialog kind', () => {
    fixture.componentInstance.form.patchValue({ minAmount: '1', currencyCode: 'ZZZ', municipality: 'unrelated' });
    fixture.componentInstance.apply();
    expect(close).not.toHaveBeenCalled();
    expect(fixture.componentInstance.error).toBe('credits.currencyUnavailable');
    currencies.next({ options: [{ code: 'USD', name: 'US Dollar' }], loading: false, failed: false });
    fixture.componentInstance.form.patchValue({ currencyCode: 'USD' });
    fixture.componentInstance.apply();
    expect(close).toHaveBeenCalledWith({ minAmount: '1', maxAmount: null, currencyCode: 'USD' });
  });
  it('constrains dialog kinds, option shapes and returned patches at compile time', () => {
    const data: CreditFilterDialogData = fixture.componentInstance.data;
    // @ts-expect-error The shared contract rejects unsupported dialog kinds.
    const invalidKind: CreditFilterDialogData = { ...data, kind: 'other' };
    // @ts-expect-error States require authoritative IDs.
    const invalidState: CreditFilterDialogData = { ...data, states: [{ name: 'Missing ID' }] };
    // @ts-expect-error Currency patches use a currency code, not a numeric ID.
    const invalidPatch: CreditFilterPatch = { minAmount: '1', maxAmount: null, currencyCode: 42 };
    // @ts-expect-error Currency choices require a currency code and name.
    const invalidCurrency: CreditCurrencyOption = { id: 1 };
    expect([
      invalidCurrency,
      invalidKind,
      invalidState,
      invalidPatch
    ]).toHaveLength(4);
  });
});
