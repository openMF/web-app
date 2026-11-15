/**
 * Copyright since 2026 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { TestBed } from '@angular/core/testing';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { TranslateModule } from '@ngx-translate/core';
import { randomUUID } from 'crypto';
import { HttpErrorResponse } from '@angular/common/http';
import { of, throwError } from 'rxjs';
import { AnpaPolicyDialogComponent } from './anpa-policy-dialog.component';
import { AnpaAccountingService } from '../../services/anpa-accounting.service';
import { AnpaAccessService } from '../../services/anpa-access.service';
import { eligibility } from './anpa.fixtures';

describe('ANPA policy draft validation', () => {
  let c: AnpaPolicyDialogComponent;
  const save: jest.Mock = jest.fn(() => of({}));
  const allows = jest.fn(() => true);
  beforeEach(() => {
    Object.defineProperty(crypto, 'randomUUID', { configurable: true, value: randomUUID });
    TestBed.configureTestingModule({
      imports: [
        AnpaPolicyDialogComponent,
        TranslateModule.forRoot()
      ],
      providers: [
        { provide: MAT_DIALOG_DATA, useValue: { loanId: 2, loan: eligibility.loan } },
        { provide: MatDialogRef, useValue: { close: jest.fn() } },
        { provide: AnpaAccountingService, useValue: { createAccountingPolicyDraft: save } },
        { provide: AnpaAccessService, useValue: { allows } }
      ]
    });
    c = TestBed.createComponent(AnpaPolicyDialogComponent).componentInstance;
    allows.mockReturnValue(true);
    save.mockReset().mockReturnValue(of({}));
  });
  function validRule() {
    c.form.patchValue({
      version: 1,
      effectiveFrom: '2026-11-15',
      approvalReference: 'Synthetic policy',
      confirmed: true
    });
    c.addRule();
    c.form.controls.rules.at(0).patchValue({
      category: 'INTEREST',
      historicalOrigin: 'REGULAR',
      currentClassification: 'REGULAR',
      sourceAccountId: 13,
      nativeMappingId: 25,
      destinationAccountId: 18,
      expenseEligible: true
    });
  }
  it('starts without invented policy rules or GL accounts', () => {
    expect(c.form.controls.rules.length).toBe(0);
    expect(c.valid).toBe(false);
  });
  it('submits an explicit versioned policy wrapper', () => {
    validRule();
    expect(c.valid).toBe(true);
    c.submit();
    expect(save).toHaveBeenCalledWith(
      2,
      expect.objectContaining({
        idempotencyKey: expect.any(String),
        policy: expect.objectContaining({ version: 1, accountingRule: 4, currency: 'USD' })
      })
    );
  });
  it('rejects identical source and destination accounts', () => {
    validRule();
    c.form.controls.rules.at(0).controls.destinationAccountId.setValue(13);
    expect(c.valid).toBe(false);
  });
  it('requires explicit tax component mapping for ITBMS', () => {
    validRule();
    const rule = c.form.controls.rules.at(0);
    rule.controls.category.setValue('ITBMS');
    expect(c.valid).toBe(false);
    rule.controls.taxComponentId.setValue(7);
    expect(c.valid).toBe(true);
  });
  it('rejects duplicate category, origin and source rules', () => {
    validRule();
    c.addRule();
    c.form.controls.rules.at(1).patchValue(c.form.controls.rules.at(0).getRawValue());
    expect(c.valid).toBe(false);
  });
  it('rejects unsupported currency/date mappings through backend validation without filling defaults', () => {
    validRule();
    c.form.controls.effectiveThrough.setValue('2020-01-01');
    expect(c.valid).toBe(false);
  });
  it.each([
    400,
    422
  ])('retains policy rules for correction after HTTP %s and uses a fresh key', (status) => {
    validRule();
    save.mockReturnValueOnce(throwError(() => new HttpErrorResponse({ status })));
    c.submit();
    expect(c.submitted()).toBe(false);
    expect(c.busy()).toBe(false);
    expect(save).toHaveBeenCalledTimes(1);
    c.form.controls.rules.at(0).controls.destinationAccountId.setValue(19);
    c.submit();
    const [
      original,
      corrected
    ] = save.mock.calls.map((call) => call[1]);
    expect(corrected.idempotencyKey).not.toBe(original.idempotencyKey);
    expect(corrected.policy.rules).toEqual([{ ...original.policy.rules[0], destinationAccountId: 19 }]);
    expect(c.error()).toBe('');
  });
  it.each([
    0,
    408,
    500,
    502,
    503,
    200
  ])('keeps policy submissions locked after uncertain HTTP %s', (status) => {
    validRule();
    save.mockReturnValue(throwError(() => new HttpErrorResponse({ status })));
    const key = c.key;
    c.submit();
    c.submit();
    expect(save).toHaveBeenCalledTimes(1);
    expect(c.submitted()).toBe(true);
    expect(c.key).toBe(key);
    expect(c.error()).toBe('labels.anpa.errors.uncertain');
  });
  it('prevents unauthorized saves', () => {
    validRule();
    allows.mockReturnValue(false);
    c.submit();
    expect(save).not.toHaveBeenCalled();
  });
});
