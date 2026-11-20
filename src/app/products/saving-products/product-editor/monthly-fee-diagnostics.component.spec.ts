/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { ChangeDetectorRef } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { HttpErrorResponse } from '@angular/common/http';
import { TranslateService } from '@ngx-translate/core';
import { of, Subject, throwError } from 'rxjs';
import { SettingsService } from 'app/settings/settings.service';
import { AuthenticationService } from 'app/core/authentication/authentication.service';
import { MonthlyFeeDiagnosticsComponent } from './monthly-fee-diagnostics.component';
import { MonthlyFeeService } from './monthly-fee.service';
import { ProductPolicyService } from './product-policy.service';
import { feeCapabilities, feePage, feeRun } from './monthly-fee.fixtures';

describe('Permission-aware monthly diagnostics orchestration', () => {
  let component: MonthlyFeeDiagnosticsComponent, permissions: string[];
  const reconciliation = {
    runId: feeRun.id,
    status: 'NOT_ATTEMPTED',
    unknownOutcomes: 0,
    nativeAccountingVerified: false,
    financialRetryAllowed: false
  };
  const api = {
    capabilities: jest.fn(),
    runs: jest.fn(),
    run: jest.fn(),
    assessments: jest.fn(),
    reconciliation: jest.fn(),
    createDiagnosticRun: jest.fn(),
    assessDiagnosticChunk: jest.fn()
  };
  beforeEach(() => {
    jest.clearAllMocks();
    permissions = [
      'READ_SAVINGS_MONTHLY_FEE',
      'ASSESS_SAVINGS_MONTHLY_FEE'
    ];
    api.capabilities.mockReturnValue(of(feeCapabilities));
    api.runs.mockReturnValue(of({ items: [feeRun], nextBeforePeriod: '2026-10', hasMore: true }));
    api.run.mockReturnValue(of(feeRun));
    api.assessments.mockReturnValue(of(feePage));
    api.reconciliation.mockReturnValue(of(reconciliation));
    api.createDiagnosticRun.mockReturnValue(of(feeRun));
    api.assessDiagnosticChunk.mockReturnValue(of(feeRun));
    TestBed.configureTestingModule({
      providers: [
        { provide: SettingsService, useValue: { tenantIdentifier: 'default', serverUrl: 'server' } },
        { provide: AuthenticationService, useValue: { getCredentials: () => ({ permissions }) } },
        { provide: ChangeDetectorRef, useValue: { markForCheck: jest.fn() } },
        { provide: MonthlyFeeService, useValue: api },
        { provide: ProductPolicyService, useValue: { businessDate: () => of('2026-11-08') } },
        { provide: TranslateService, useValue: { instant: (key: string) => key } }
      ]
    });
    component = TestBed.runInInjectionContext(() => new MonthlyFeeDiagnosticsComponent());
    jest.spyOn(window, 'confirm').mockReturnValue(true);
  });
  afterEach(() => jest.restoreAllMocks());
  it('clears tenant evidence and cancels pending reads when tenant selection changes', () => {
    component.open();
    component.select(feeRun.id);
    const pending = new Subject<typeof feePage>();
    api.assessments.mockReturnValue(pending);
    component.assessments();
    const settings = TestBed.inject(SettingsService);
    Object.assign(settings, { tenantIdentifier: 'secondary' });
    component.ngDoCheck();
    expect(component.run).toBeNull();
    expect(component.history).toBeNull();
    expect(component.pageBusy).toBe(false);
    pending.next(feePage);
    pending.complete();
    expect(component.page).toBeNull();
  });
  it('opening is lazy, read-only and idempotent', () => {
    expect(api.runs).not.toHaveBeenCalled();
    component.open();
    component.open();
    expect(api.runs).toHaveBeenCalledTimes(1);
    expect(api.createDiagnosticRun).not.toHaveBeenCalled();
    expect(api.assessDiagnosticChunk).not.toHaveBeenCalled();
    expect(component.form.controls.period.value).toBe('');
  });
  it('denies reads and writes without dedicated monthly-fee permissions', () => {
    permissions = ['UPDATE_SAVINGS_PRODUCT_POLICY'];
    component.open();
    component.load();
    component.select(feeRun.id);
    component.create();
    expect(api.capabilities).not.toHaveBeenCalled();
    expect(api.run).not.toHaveBeenCalled();
    expect(api.createDiagnosticRun).not.toHaveBeenCalled();
  });
  it('permits ALL_FUNCTIONS_READ reads without assessment', () => {
    permissions = ['ALL_FUNCTIONS_READ'];
    component.open();
    component.form.controls.period.setValue('2026-10');
    component.create();
    expect(component.canAssess).toBe(false);
    expect(api.runs).toHaveBeenCalled();
    expect(api.createDiagnosticRun).not.toHaveBeenCalled();
  });
  it('requires the backend month, explicit confirmation, capability and assessment permission', () => {
    component.open();
    component.form.controls.period.setValue('2026-11');
    component.create();
    expect(api.createDiagnosticRun).not.toHaveBeenCalled();
    component.form.controls.period.setValue('2026-10');
    jest.spyOn(window, 'confirm').mockReturnValue(false);
    component.create();
    expect(api.createDiagnosticRun).not.toHaveBeenCalled();
    jest.spyOn(window, 'confirm').mockReturnValue(true);
    component.capabilities = { ...feeCapabilities, diagnosticAssessmentSupported: false };
    component.create();
    expect(api.createDiagnosticRun).not.toHaveBeenCalled();
    component.capabilities = feeCapabilities;
    component.create();
    expect(api.createDiagnosticRun).toHaveBeenCalledWith('2026-10');
    expect(api.run).toHaveBeenCalledWith(feeRun.id);
  });
  it('uses only the backend history and assessment cursors', () => {
    component.open();
    component.moreRuns();
    expect(api.runs).toHaveBeenLastCalledWith('2026-10');
    component.select(feeRun.id);
    component.assessments();
    expect(api.assessments).toHaveBeenLastCalledWith(feeRun.id, feePage.nextAfterId);
    component.assessments(true);
    expect(api.assessments).toHaveBeenLastCalledWith(feeRun.id, '0');
  });
  it('does not overlap processing, change runs mid-request or automatically continue', () => {
    component.open();
    component.select(feeRun.id);
    const pending = new Subject<typeof feeRun>();
    api.assessDiagnosticChunk.mockReturnValue(pending);
    component.process();
    component.process();
    component.select('another-run');
    expect(api.assessDiagnosticChunk).toHaveBeenCalledTimes(1);
    expect(component.writing).toBe(true);
    pending.next(feeRun);
    pending.complete();
    expect(component.writing).toBe(false);
    expect(api.assessDiagnosticChunk).toHaveBeenCalledTimes(1);
    expect(api.run).toHaveBeenLastCalledWith(feeRun.id);
  });
  it.each([
    'DIAGNOSTIC_COMPLETE',
    'RECONCILIATION_REQUIRED',
    'UNREVIEWED_STATUS'
  ])('blocks processing of %s', (status) => {
    component.open();
    component.select(feeRun.id);
    component.run = { ...feeRun, status };
    component.process();
    expect(api.assessDiagnosticChunk).not.toHaveBeenCalled();
  });
  it('blocks unknown outcomes and invalid batch size even for an admin', () => {
    permissions = ['ALL_FUNCTIONS'];
    component.open();
    component.select(feeRun.id);
    component.run = { ...feeRun, unknown: 1 };
    component.process();
    component.run = feeRun;
    component.form.controls.limit.setValue(1.5);
    component.process();
    expect(api.assessDiagnosticChunk).not.toHaveBeenCalled();
  });
  it('requires explicit evidence reload after an uncertain POST, with no automatic retry', () => {
    component.open();
    component.select(feeRun.id);
    api.assessDiagnosticChunk.mockReturnValue(throwError(() => new HttpErrorResponse({ status: 0 })));
    component.process();
    component.process();
    expect(api.assessDiagnosticChunk).toHaveBeenCalledTimes(1);
    expect(component.writeUncertain).toBe(true);
    expect(component.error).toBe('FinancialControls.RequestFailed');
    component.select(feeRun.id);
    expect(component.writeUncertain).toBe(false);
  });
  it.each([
    401,
    403,
    404,
    409,
    500
  ])('exposes a failed diagnostic read without a success state (%s)', (status) => {
    api.run.mockReturnValue(throwError(() => new HttpErrorResponse({ status })));
    component.open();
    component.select(feeRun.id);
    expect(component.error).toBeTruthy();
    expect(component.run).toBeNull();
    expect(component.page).toBeNull();
  });
  it('clears old evidence on run changes and rejects mismatched responses', () => {
    component.open();
    component.select(feeRun.id);
    api.reconciliation.mockReturnValue(of({ ...reconciliation, runId: 'different' }));
    component.select(feeRun.id);
    expect(component.run).toBeNull();
    expect(component.reconciliation).toBeNull();
    expect(component.error).toBe('FinancialControls.InvalidResponse');
  });
  it('does not turn a 403 capability failure into an empty successful history', () => {
    api.capabilities.mockReturnValue(throwError(() => new HttpErrorResponse({ status: 403 })));
    component.open();
    expect(component.capabilities).toBeNull();
    expect(component.history).toBeNull();
    expect(component.error).toBe('SavingsEditor.Denied');
  });
});
