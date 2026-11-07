/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { TestBed } from '@angular/core/testing';
import { ChangeDetectorRef, SimpleChange } from '@angular/core';
import { of, Subject, throwError } from 'rxjs';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { TranslateService } from '@ngx-translate/core';
import { ProductPolicyService } from './product-policy.service';
import { InterestMatrixService } from './interest-matrix.service';
import { ReferenceRateService } from './reference-rate.service';
import { InterestConfigurationComponent } from './interest-configuration.component';
import { policy, capabilities } from './product-policy.fixtures';
import { InterestMatrix } from './interest-rate.model';
import { matrix, formula } from './interest-rate.fixtures';

describe('Interest Configuration interactions and concurrency', () => {
  let c: InterestConfigurationComponent, matrices: any, rates: any, policies: any;
  const configuration = {
    savingsProductId: 42,
    revision: 5,
    status: 'DRAFT',
    capabilities,
    policy: {
      ...policy,
      classification: 'SAVINGS',
      interestMode: 'TIERED',
      maximumBalance: '10000',
      interestMatrix: matrix
    }
  };
  beforeEach(() => {
    matrices = {
      configuration: jest.fn(() =>
        of({ savingsProductId: 42, revision: 5, financialOperational: false, blockers: [], matrix })
      ),
      write: jest.fn(() => of({ revision: 6 })),
      selection: jest.fn(() => of({ financialOperational: false }))
    };
    rates = {
      configuration: jest.fn(() =>
        of({ savingsProductId: 42, revision: 5, financialOperational: false, blockers: [], formula })
      ),
      saveFormula: jest.fn(() => of({ revision: 6 })),
      preview: jest.fn(() => of({ financialOperational: false }))
    };
    policies = { configuration: jest.fn(() => of({ ...configuration, revision: 6 })) };
    TestBed.configureTestingModule({
      providers: [
        { provide: HttpClient, useValue: { post: jest.fn(), put: jest.fn() } },
        { provide: ChangeDetectorRef, useValue: { markForCheck: jest.fn() } },
        { provide: InterestMatrixService, useValue: matrices },
        { provide: ReferenceRateService, useValue: rates },
        { provide: ProductPolicyService, useValue: policies },
        { provide: TranslateService, useValue: { instant: (key: string) => key } }
      ]
    });
    c = TestBed.runInInjectionContext(() => new InterestConfigurationComponent());
    c.configuration = configuration as any;
    c.context = { currency: 'MXN', digits: 2, opening: '0', rate: '0' };
    c.mode = 'TIERED';
    c.blocked = false;
    c.ngOnChanges({ configuration: new SimpleChange(null, configuration, true) });
  });
  it('adds, edits and removes reactive rows without assuming a rate or reordering', () => {
    c.add();
    expect(c.rows.length).toBe(3);
    expect(c.rows.at(2).value.annualRatePercent).toBe('');
    c.rows.at(2).patchValue({ lowerBalance: '100', upperBalance: '200', annualRatePercent: '3' });
    expect(c.matrix().brackets[2].annualRatePercent).toBe('3');
    c.remove(2);
    expect(c.rows.length).toBe(2);
    expect(c.dirty).toBe(true);
  });
  it('caps rows at fifty and disables mutations for read-only/pending/dirty-parent state', () => {
    for (let i = 0; i < 60; i++) c.add();
    expect(c.rows.length).toBe(50);
    c.blocked = true;
    c.remove(0);
    c.validate(true);
    expect(c.rows.length).toBe(50);
    expect(matrices.write).not.toHaveBeenCalled();
  });
  it('retains invalid input and reports row-specific boundary errors without a request', () => {
    c.rows.at(1).controls.lowerBalance.setValue('1000.02');
    c.matrixForm.markAsDirty();
    c.validate(true);
    expect(c.matrixIssues(1, 'lowerBalance')[0].key).toBe('InterestManagement.Continuity');
    expect(matrices.write).not.toHaveBeenCalled();
    expect(c.rows.at(1).value.lowerBalance).toBe('1000.02');
  });
  it('validates before saving using the same revision and waits for aggregate readback', () => {
    const readback = new Subject<any>();
    policies.configuration.mockReturnValue(readback);
    c.matrixForm.markAsDirty();
    const saved = jest.fn();
    c.saved.subscribe(saved);
    c.validate(true);
    expect(matrices.write.mock.calls.map((call: any[]) => call[3])).toEqual([
      true,
      undefined
    ]);
    expect(c.busy).toBe(true);
    expect(c.dirty).toBe(true);
    readback.next({ ...configuration, revision: 6 });
    readback.complete();
    expect(c.dirty).toBe(false);
    expect(c.loadedRevision).toBe(6);
    expect(saved).toHaveBeenCalled();
    c.ngOnChanges({ configuration: new SimpleChange(configuration, c.configuration, false) });
    expect(c.notice).toBe('SavingsEditor.DraftSaved');
  });
  it('preserves unsaved input on HTTP 409 and prevents stale retries', () => {
    matrices.write.mockReturnValue(throwError(() => new HttpErrorResponse({ status: 409 })));
    c.rows.at(1).controls.annualRatePercent.setValue('3.123456');
    c.matrixForm.markAsDirty();
    c.validate(true);
    expect(c.conflict).toBe(true);
    expect(c.dirty).toBe(true);
    expect(c.rows.at(1).value.annualRatePercent).toBe('3.123456');
    c.validate(true);
    expect(matrices.write).toHaveBeenCalledTimes(1);
    expect(policies.configuration).not.toHaveBeenCalled();
  });
  it('does not discard dirty rows on unrelated input changes and asks before explicit refresh', () => {
    c.rows.at(0).controls.annualRatePercent.setValue('3');
    c.matrixForm.markAsDirty();
    c.ngOnChanges({ blocked: new SimpleChange(false, true, false) });
    expect(c.rows.at(0).value.annualRatePercent).toBe('3');
    jest.spyOn(window, 'confirm').mockReturnValueOnce(false);
    c.load();
    expect(c.rows.at(0).value.annualRatePercent).toBe('3');
  });
  it('detects an aggregate revision mismatch on read instead of upgrading its write token', () => {
    matrices.configuration.mockReturnValue(of({ revision: 6, financialOperational: false }));
    c.load(false);
    expect(c.conflict).toBe(true);
    expect(c.loadedRevision).toBe(5);
  });
  it('saves additive/factor settings with derived definition and clears irrelevant parameters on explicit switch', () => {
    c.mode = 'REFERENCE_RATE';
    c.configuration = { ...configuration, policy: { ...configuration.policy, interestMode: 'REFERENCE_RATE' } } as any;
    c.definitions = [{ referenceId: formula.referenceId, referenceType: 'CETES', tenor: 'D28' }] as any;
    c.formulaForm.patchValue({ ...formula, spreadPercentagePoints: formula.spreadPercentagePoints });
    c.formulaForm.markAsDirty();
    c.saveFormula();
    expect(rates.saveFormula.mock.calls[0][2]).toEqual(formula);
    c.configuration = { ...configuration, policy: { ...configuration.policy, interestMode: 'REFERENCE_RATE' } } as any;
    c.loadedRevision = 5;
    c.formulaForm.patchValue({
      referenceId: formula.referenceId,
      formulaMode: 'MULTIPLICATIVE_FACTOR',
      multiplier: '1.20'
    });
    c.formulaModeChanged();
    expect(c.formulaForm.value.spreadPercentagePoints).toBe('');
    c.saveFormula();
    expect(rates.saveFormula.mock.calls[1][2]).toMatchObject({ multiplier: '1.20', spreadPercentagePoints: null });
  });
  it('uses deliberate exact-date preview and handles missing approved fixing without changing formula input', () => {
    c.mode = 'REFERENCE_RATE';
    c.formulaForm.controls.spreadPercentagePoints.setValue('1.000000000001');
    rates.preview.mockReturnValue(
      throwError(
        () =>
          new HttpErrorResponse({
            status: 400,
            error: { errors: [{ parameterName: 'benchmarkFixing', defaultUserMessage: 'No unique fixing' }] }
          })
      )
    );
    c.reviewForm.controls.businessDate.setValue('2026-11-09');
    c.review();
    expect(rates.preview).toHaveBeenCalledWith(42, '2026-11-09');
    expect(c.preview).toBeNull();
    expect(c.error).toBe('InterestManagement.MissingFixing');
    expect(c.formulaForm.value.spreadPercentagePoints).toBe('1.000000000001');
  });
  it('shows a local serialization failure and clears busy state without losing the matrix', () => {
    const actualService = TestBed.runInInjectionContext(() => new InterestMatrixService());
    matrices.write.mockImplementation((id: number, revision: number, value: InterestMatrix, validate: boolean) =>
      actualService.write(id, revision, value, validate)
    );
    c.rows.at(0).controls.lowerBalance.setValue('0.0000000000000');
    c.matrixForm.markAsDirty();
    expect(() => c.validate()).not.toThrow();
    expect(c.error).toBe('SavingsEditor.RequestFailed');
    expect(c.busy).toBe(false);
    expect(c.matrixForm.dirty).toBe(true);
    expect(c.rows.at(0).value.lowerBalance).toBe('0.0000000000000');
    const http = TestBed.inject(HttpClient);
    expect(http.post).not.toHaveBeenCalled();
    expect(http.put).not.toHaveBeenCalled();
  });
});
