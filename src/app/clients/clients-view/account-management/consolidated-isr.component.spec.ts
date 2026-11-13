/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { TestBed } from '@angular/core/testing';
import { DatePipe } from '@angular/common';
import { provideNativeDateAdapter } from '@angular/material/core';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { provideRouter } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { of, Subject, throwError } from 'rxjs';
import { readFileSync, readdirSync } from 'fs';
import { ConsolidatedIsrComponent } from './consolidated-isr.component';
import { ConsolidatedIsrService } from './consolidated-isr.service';
import { AccountManagementAccess } from './account-management-access.service';
import { SettingsService } from 'app/settings/settings.service';
import { ISR_CAPABILITIES, ISR_CODE_KEYS, IsrContractError, IsrPreview } from './consolidated-isr.model';
import {
  isrCapabilities,
  isrId,
  isrEligibility,
  isrSources,
  isrPreview,
  isrCalculation,
  isrReconciliation
} from '../../../../../playwright/fixtures/consolidated-isr-data';

const english = JSON.parse(readFileSync('src/assets/translations/en-US.json', 'utf8'));
describe('Consolidated ISR customer visibility', () => {
  let denied: Set<string>;
  let api: ReturnType<typeof stub>;
  function stub() {
    return {
      template: jest.fn(() => of(isrCapabilities)),
      eligibility: jest.fn(() => of(isrEligibility())),
      accounts: jest.fn(() => of(isrSources())),
      preview: jest.fn(() => of(isrPreview())),
      history: jest.fn(() => of([{ sequence: 41, calculation: isrCalculation() }])),
      calculation: jest.fn(() => of(isrCalculation())),
      audit: jest.fn(() => of([])),
      reconciliation: jest.fn(() => of(isrReconciliation))
    };
  }
  beforeEach(() => {
    denied = new Set();
    api = stub();
    TestBed.configureTestingModule({ imports: [
        ConsolidatedIsrComponent,
        TranslateModule.forRoot(),
        NoopAnimationsModule
      ], providers: [
        provideNativeDateAdapter(),
        provideRouter([]),
        DatePipe,
        { provide: SettingsService, useValue: { dateFormat: 'yyyy-MM-dd', language: { code: 'en-US' } } },
        { provide: AccountManagementAccess, useValue: { has: (key: string) => !denied.has(key) } },
        { provide: ConsolidatedIsrService, useValue: api }
      ] });
    const translate = TestBed.inject(TranslateService);
    translate.setTranslation('en-US', english);
    translate.use('en-US');
  });
  function start() {
    const fixture = TestBed.createComponent(ConsolidatedIsrComponent);
    fixture.componentRef.setInput('clientId', 7);
    fixture.detectChanges();
    return fixture;
  }
  function inspect(component: ConsolidatedIsrComponent) {
    component.form.setValue({ from: new Date(2026, 10, 1), through: new Date(2026, 10, 12) });
    component.inspectPeriod();
  }
  it('loads capabilities and diagnostic history without guessing a fiscal period', () => {
    const f = start();
    expect(api.template).toHaveBeenCalledTimes(1);
    expect(api.preview).not.toHaveBeenCalled();
    expect(f.nativeElement.textContent).toContain('Select a diagnostic period');
    expect(f.nativeElement.textContent).toContain('not tax filings or payments');
  });
  it('shows policy-blocked results and never replaces nulls with zero or native withholding', () => {
    const f = start();
    inspect(f.componentInstance);
    f.detectChanges();
    for (const field of [
      'isr-taxable-base',
      'isr-calculated',
      'isr-actual-withheld'
    ]) expect(f.nativeElement.querySelector(`[data-testid="${field}"]`).textContent.trim()).toBe('Not established');
    expect(f.nativeElement.textContent).toContain('Policy approval required');
    expect(f.nativeElement.textContent).toContain('0.25 MXN');
    expect(f.nativeElement.textContent).toContain('88.25 USD');
    expect(f.nativeElement.textContent).toContain('not approved consolidated taxable balances');
    expect(f.nativeElement.querySelector('[data-testid="isr-eligible-count"]').textContent.trim()).toBe('0');
    expect(f.nativeElement.textContent).toContain('not currently available');
    expect(f.nativeElement.querySelector('button[data-testid="withhold-isr"]')).toBeNull();
  });
  it('retains ineligible and unsupported accounts for explanation', () => {
    const f = start();
    inspect(f.componentInstance);
    f.detectChanges();
    expect(f.componentInstance.eligibility().data.accounts).toHaveLength(2);
    expect(f.nativeElement.textContent).toContain('18');
    expect(f.nativeElement.textContent).toContain('22');
    expect(f.nativeElement.textContent).toContain('Account classification unsupported');
  });
  it('shows incomplete source warnings and does not claim a complete eligible count', () => {
    api.eligibility.mockReturnValue(of({ ...isrEligibility(), populationComplete: false }));
    api.accounts.mockReturnValue(of({ ...isrSources(), complete: false, observations: [] }));
    const f = start();
    inspect(f.componentInstance);
    f.detectChanges();
    expect(f.componentInstance.eligibleCount).toBeNull();
    expect(f.nativeElement.textContent).toContain('Incomplete account data');
    expect(f.nativeElement.querySelector('[data-testid="isr-eligible-count"]').textContent).toContain(
      'Not established'
    );
  });
  it('shows empty account and empty history states', () => {
    api.history.mockReturnValue(of([]));
    api.eligibility.mockReturnValue(of({ ...isrEligibility(), accounts: [] }));
    const f = start();
    inspect(f.componentInstance);
    f.detectChanges();
    expect(f.nativeElement.textContent).toContain('No accounts in the diagnostic population');
    expect(f.nativeElement.textContent).toContain(english.AccountManagement.NoHistory);
  });
  it('fails closed on missing template, with a localized retry and no downstream reads', () => {
    api.template.mockReturnValue(
      throwError(() => new HttpErrorResponse({ status: 404, error: { secret: 'never display this' } }))
    );
    const f = start();
    expect(f.nativeElement.textContent).toContain('This capability endpoint is unavailable');
    expect(f.nativeElement.textContent).not.toContain('never display this');
    expect(api.history).not.toHaveBeenCalled();
    inspect(f.componentInstance);
    expect(api.eligibility).not.toHaveBeenCalled();
    api.template.mockReturnValue(of(isrCapabilities));
    f.componentInstance.reload();
    f.detectChanges();
    expect(api.history).toHaveBeenCalledTimes(1);
  });
  it('shows an explicit backend-version error', () => {
    api.template.mockReturnValue(throwError(() => new IsrContractError()));
    expect(start().nativeElement.textContent).toContain('backend response is incompatible');
  });
  it('requires exact eligibility permission before any reads', () => {
    denied.add('READ_CONSOLIDATED_ISR_ELIGIBILITY');
    const f = start();
    inspect(f.componentInstance);
    expect(api.template).not.toHaveBeenCalled();
    expect(api.eligibility).not.toHaveBeenCalled();
    expect(f.nativeElement.textContent).toContain(english.AccountManagement.Forbidden);
  });
  it('keeps eligibility visible without the accounts, preview or history permissions', () => {
    denied.add('READ_CONSOLIDATED_ISR');
    denied.add('PREVIEW_CONSOLIDATED_ISR');
    const f = start();
    inspect(f.componentInstance);
    expect(api.eligibility).toHaveBeenCalled();
    expect(api.accounts).not.toHaveBeenCalled();
    expect(api.preview).not.toHaveBeenCalled();
    expect(api.history).not.toHaveBeenCalled();
  });
  it('treats partial capabilities as unknown and unavailable', () => {
    api.template.mockReturnValue(of({ eligibilityDiagnostics: true }));
    const f = start();
    inspect(f.componentInstance);
    f.detectChanges();
    expect(api.accounts).not.toHaveBeenCalled();
    expect(api.history).not.toHaveBeenCalled();
    expect(f.componentInstance.booleanKey(undefined)).toBe('ConsolidatedIsr.NotReported');
    expect(f.nativeElement.textContent).toContain('pending approved tax rules');
  });
  it('does not enable inspection when eligibility capability is false', () => {
    api.template.mockReturnValue(of({ ...isrCapabilities, eligibilityDiagnostics: false }));
    const f = start();
    inspect(f.componentInstance);
    expect(api.eligibility).not.toHaveBeenCalled();
  });
  it('does not call diagnostic APIs for invalid dates', () => {
    const f = start();
    for (const dates of [
      { from: new Date(2026, 10, 12), through: new Date(2026, 10, 1) },
      { from: new Date(2024, 0, 1), through: new Date(2026, 10, 1) },
      { from: new Date(), through: new Date(9999, 0, 1) },
      { from: null, through: null }
    ]) {
      f.componentInstance.form.setValue(dates);
      f.componentInstance.inspectPeriod();
    }
    expect(api.preview).not.toHaveBeenCalled();
  });
  it('cancels old period responses immediately when dates are edited', () => {
    const old = new Subject<IsrPreview>();
    api.preview.mockReturnValue(old);
    const f = start();
    inspect(f.componentInstance);
    expect(old.observed).toBe(true);
    f.componentInstance.form.controls.from.setValue(new Date(2026, 10, 2));
    expect(old.observed).toBe(false);
    old.next(isrPreview());
    expect(f.componentInstance.preview().data).toBeNull();
    expect(f.componentInstance.loadedPeriod()).toBeNull();
  });
  it('cancels customer reads and clears all detail/audit/reconciliation on customer switching', () => {
    const old = new Subject<IsrPreview>();
    api.preview.mockReturnValue(old);
    const f = start();
    inspect(f.componentInstance);
    f.componentInstance.select(isrId);
    f.componentInstance.inspectReconciliation();
    f.componentRef.setInput('clientId', 8);
    f.detectChanges();
    old.next(isrPreview());
    expect(old.observed).toBe(false);
    expect(f.componentInstance.preview().data).toBeNull();
    expect(f.componentInstance.detail().data).toBeNull();
    expect(f.componentInstance.reconciliation().data).toBeNull();
    expect(f.componentInstance.selectedId()).toBeNull();
    expect(api.history).toHaveBeenLastCalledWith(8, 0);
  });
  it('cancels an older selected snapshot response', () => {
    const old = new Subject<ReturnType<typeof isrCalculation>>();
    api.calculation.mockReturnValueOnce(old);
    const f = start();
    f.componentInstance.select(isrId);
    const newer = { ...isrCalculation(), calculationId: 'd4a2587e-564a-4bb8-92f8-ad15ded9a401' };
    api.calculation.mockReturnValueOnce(of(newer));
    f.componentInstance.select(newer.calculationId);
    old.next(isrCalculation());
    expect(old.observed).toBe(false);
    expect(f.componentInstance.detail().data).toBe(newer);
  });
  it('paginates history using the last sequence, not the calculation UUID', () => {
    api.history.mockReturnValueOnce(
      of(Array.from({ length: 25 }, (_, index) => ({ sequence: 100 + index, calculation: isrCalculation() })))
    );
    const f = start();
    expect(f.componentInstance.history().more).toBe(true);
    api.history.mockReturnValueOnce(of([]));
    f.componentInstance.loadHistory();
    expect(api.history).toHaveBeenLastCalledWith(7, 124);
    expect(f.componentInstance.history().more).toBe(false);
  });
  it('paginates audit and never renders sensitive detailsJson', () => {
    api.audit.mockReturnValueOnce(
      of([
        {
          id: 15,
          action: 'ASSESSMENT_SAVED',
          actorId: 1,
          businessDate: '2026-11-12',
          recordedAt: '2026-11-12T08:00:00Z',
          detailsJson: 'private source payload'
        }
      ])
    );
    const f = start();
    f.componentInstance.select(isrId);
    f.componentInstance.loadAudit();
    f.detectChanges();
    expect(api.audit).toHaveBeenCalledWith(7, isrId, 0);
    expect(f.nativeElement.textContent).toContain('Diagnostic assessment saved');
    expect(f.nativeElement.textContent).not.toContain('private source payload');
    f.componentInstance.loadAudit();
    expect(api.audit).toHaveBeenLastCalledWith(7, isrId, 15);
  });
  it('does not request audit or reconciliation without their separate permissions', () => {
    denied.add('READ_CONSOLIDATED_ISR_AUDIT');
    denied.add('RECONCILE_CONSOLIDATED_ISR');
    const f = start();
    f.componentInstance.select(isrId);
    f.componentInstance.loadAudit();
    f.componentInstance.inspectReconciliation();
    expect(api.audit).not.toHaveBeenCalled();
    expect(api.reconciliation).not.toHaveBeenCalled();
  });
  it.each([
    'RECONCILIATION_REQUIRED',
    'UNCHANGED_BLOCKED'
  ])('shows %s as diagnostic evidence with no financial retry action', (status) => {
    api.reconciliation.mockReturnValue(of({ ...isrReconciliation, status }));
    const f = start();
    f.componentInstance.select(isrId);
    f.componentInstance.inspectReconciliation();
    f.detectChanges();
    expect(f.nativeElement.textContent).toContain(
      english.ConsolidatedIsr[status === 'UNCHANGED_BLOCKED' ? 'UnchangedBlocked' : 'ReconciliationRequired']
    );
    expect(f.nativeElement.textContent).toContain('Source data changed');
    expect(f.componentInstance.reconciliation().data.financialRetryAllowed).toBe(false);
  });
  it('uses localized safe fallbacks for unknown backend codes', () => {
    const f = start();
    expect(f.componentInstance.codeKey('INTERNAL_SECRET_CODE')).toBe('ConsolidatedIsr.UnknownDiagnostic');
    expect(f.componentInstance.codeKey('__proto__')).toBe('ConsolidatedIsr.UnknownDiagnostic');
  });
  it('never persists customer tax evidence and cancels outstanding reads on destruction', () => {
    const local = jest.spyOn(Storage.prototype, 'setItem');
    const old = new Subject<IsrPreview>();
    api.preview.mockReturnValue(old);
    const f = start();
    inspect(f.componentInstance);
    f.destroy();
    expect(old.observed).toBe(false);
    expect(local).not.toHaveBeenCalled();
    local.mockRestore();
  });
});

function flatten(data: Record<string, unknown>, prefix = ''): Record<string, string> {
  return Object.fromEntries(
    Object.entries(data).flatMap(
      ([
        key,
        value
      ]) =>
        typeof value === 'object' && value !== null
          ? Object.entries(flatten(value as Record<string, unknown>, prefix + key + '.'))
          : [[
                prefix + key,
                String(value)
              ]]
    )
  );
}
describe('ISR translations', () => {
  const reference = flatten(english);
  it.each(readdirSync('src/assets/translations').filter((f) => f.endsWith('.json')))(
    '%s covers all ISR labels and known diagnostic codes',
    (file) => {
      const locale = flatten(JSON.parse(readFileSync('src/assets/translations/' + file, 'utf8')));
      const keys = Object.keys(reference).filter((key) => key.startsWith('ConsolidatedIsr.'));
      expect(
        Object.keys(locale)
          .filter((key) => key.startsWith('ConsolidatedIsr.'))
          .sort()
      ).toEqual(keys.sort());
      for (const key of [
        ...keys,
        'labels.commons.Yes',
        'labels.commons.No',
        ...Object.values(ISR_CODE_KEYS),
        ...ISR_CAPABILITIES.map((name) => 'ConsolidatedIsr.Capabilities.' + name)
      ]) expect(locale[key]?.trim()).toBeTruthy();
      const html = readFileSync(
        'src/app/clients/clients-view/account-management/consolidated-isr.component.html',
        'utf8'
      );
      for (const match of html.matchAll(/'([A-Za-z][A-Za-z0-9. ]+)'\s*\|\s*translate/g))
        expect(locale[match[1]]).toBeTruthy();
    }
  );
});
