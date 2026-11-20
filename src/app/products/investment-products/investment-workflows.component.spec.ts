/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { TestBed } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap, provideRouter, Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { AuthenticationService } from 'app/core/authentication/authentication.service';
import { HttpErrorResponse } from '@angular/common/http';
import { of, Subject, throwError } from 'rxjs';
import { InvestmentRateManagerComponent } from './investment-rate-manager.component';
import { InvestmentPolicyEditorComponent } from './investment-policy-editor.component';
import { InvestmentProductsComponent } from './investment-products.component';
import { InvestmentRateLookupComponent } from './investment-rate-lookup.component';
import { InvestmentHistoryComponent } from './investment-history.component';
import { InvestmentAccessService } from './investment-access.service';
import { InvestmentProductService } from './investment-product.service';
import {
  configurationFixture,
  policyTemplateFixture,
  rateFixture,
  rateTemplateFixture,
  rateWriteFixture
} from './investment-product.fixtures';
import { InvestmentPublishDialogComponent } from './investment-publish-dialog.component';
const english = require('../../../assets/translations/en-US.json');
describe('investment administrative workflows', () => {
  const access = { has: jest.fn(() => true), userId: 2 };
  const dialog = {
    open: jest.fn((component: unknown) => ({
      afterClosed: () =>
        of<boolean | { confirm: boolean }>(component === InvestmentPublishDialogComponent ? true : { confirm: true })
    }))
  };
  const service = {
    getRateTemplate: jest.fn(),
    getRateDraft: jest.fn(),
    getCurrentRate: jest.fn(),
    getInvestmentConfiguration: jest.fn(),
    getInvestmentTemplate: jest.fn(),
    validateRateDraft: jest.fn(),
    saveRateDraft: jest.fn(),
    publishRate: jest.fn(),
    validateInvestmentConfiguration: jest.fn(),
    saveInvestmentConfiguration: jest.fn(),
    catalog: jest.fn(),
    getRateVersions: jest.fn(),
    getRateHistory: jest.fn(),
    getRateSchedule: jest.fn(),
    getInvestmentHistory: jest.fn(),
    getRateVersion: jest.fn(),
    selectRate: jest.fn()
  };
  beforeEach(() => {
    jest.clearAllMocks();
    access.has.mockReturnValue(true);
    access.userId = 2;
    service.getRateTemplate.mockReturnValue(of(rateTemplateFixture));
    service.getRateDraft.mockReturnValue(of(rateFixture));
    service.getCurrentRate.mockReturnValue(of(null));
    service.getInvestmentConfiguration.mockReturnValue(of(configurationFixture));
    service.getInvestmentTemplate.mockReturnValue(of(policyTemplateFixture));
    service.validateRateDraft.mockReturnValue(
      of({ valid: true, publishable: true, blockers: [], configuration: rateWriteFixture })
    );
    service.saveRateDraft.mockReturnValue(of({ ...rateFixture, revision: 2 }));
    service.publishRate.mockReturnValue(of({ ...rateFixture, version: 1, status: 'APPROVED_EFFECTIVE' }));
    service.getRateVersions.mockReturnValue(of([]));
    service.getRateSchedule.mockReturnValue(of([]));
    service.getRateHistory.mockReturnValue(of([]));
    service.getInvestmentHistory.mockReturnValue(of([]));
    service.catalog.mockReturnValue(of([]));
    TestBed.configureTestingModule({
      imports: [
        TranslateModule.forRoot(),
        NoopAnimationsModule
      ],
      providers: [
        { provide: AuthenticationService, useValue: { getCredentials: () => ({ permissions: ['ALL_FUNCTIONS'] }) } },
        provideRouter([]),
        {
          provide: ActivatedRoute,
          useValue: { snapshot: { parent: { paramMap: convertToParamMap({ productId: '41' }) } } }
        },
        { provide: InvestmentAccessService, useValue: access },
        { provide: InvestmentProductService, useValue: service },
        { provide: MatDialog, useValue: dialog }
      ]
    });
    TestBed.overrideComponent(InvestmentRateManagerComponent, {
      add: { providers: [{ provide: MatDialog, useValue: dialog }] }
    });
    TestBed.overrideComponent(InvestmentPolicyEditorComponent, {
      add: { providers: [{ provide: MatDialog, useValue: dialog }] }
    });
    TestBed.overrideProvider(MatDialog, { useValue: dialog });
    TestBed.overrideProvider(AuthenticationService, {
      useValue: { getCredentials: () => ({ permissions: ['ALL_FUNCTIONS'] }) }
    });
    const translate = TestBed.inject(TranslateService);
    translate.setTranslation('en-US', english);
    translate.use('en-US');
  });
  function rates() {
    const component = TestBed.createComponent(InvestmentRateManagerComponent).componentInstance;
    component.ngOnInit();
    return component;
  }
  it('loads draft form and tenant timezone without using the browser timezone', () => {
    const component = rates();
    expect(component.template().timezone).toBe('America/Mexico_City');
    expect(component.payload().matrix.cells[0].annualRatePercent).toBe('14.000001');
  });
  it('initializes a missing draft with revision zero and blank rate cells', () => {
    service.getRateDraft.mockReturnValue(throwError(() => new HttpErrorResponse({ status: 404 })));
    const component = rates();
    expect(component.payload().expectedRevision).toBe(0);
    expect(component.payload().matrix.cells[0].annualRatePercent).toBe('');
  });
  it('validates and saves a draft without publishing', () => {
    const component = rates();
    component.matrix.markAsDirty();
    component.submit(true);
    expect(service.validateRateDraft).toHaveBeenCalled();
    expect(service.saveRateDraft).toHaveBeenCalled();
    expect(service.publishRate).not.toHaveBeenCalled();
    expect(component.draft().revision).toBe(2);
    expect(component.dirty).toBe(false);
  });
  it('preserves unsaved input on revision conflict and blocks further writes until reload', () => {
    service.saveRateDraft.mockReturnValue(throwError(() => new HttpErrorResponse({ status: 409 })));
    const component = rates();
    component.matrix.markAsDirty();
    component.submit(true);
    expect(component.conflict()).toBe(true);
    expect(component.dirty).toBe(true);
    expect(component.payload().matrix.cells[0].annualRatePercent).toBe('14.000001');
    component.submit(true);
    expect(service.saveRateDraft).toHaveBeenCalledTimes(1);
  });
  it('uses null date for immediate validity and preserves scheduled date text', () => {
    const component = rates();
    component.form.patchValue({ mode: 'IMMEDIATE', effectiveDate: '2026-12-10' });
    expect(component.payload().effectiveValidity.effectiveDate).toBeNull();
    component.form.patchValue({ mode: 'SCHEDULED' });
    expect(component.payload().effectiveValidity).toEqual({ mode: 'SCHEDULED', effectiveDate: '2026-12-10' });
  });
  it('requires an independent checker even for privileged users', () => {
    access.userId = 1;
    const component = rates();
    expect(component.independent).toBe(true);
    component.publish();
    expect(service.publishRate).not.toHaveBeenCalled();
  });
  it('publishes the displayed revision only after boolean confirmation and preserves the checker message', () => {
    access.has.mockImplementation((permission?: string) => permission !== 'MANAGE_INVESTMENT_RATE');
    const confirmed = new Subject<boolean>();
    dialog.open.mockReturnValueOnce({ afterClosed: () => confirmed });
    const component = rates();
    component.publish();
    expect(dialog.open).toHaveBeenCalledWith(
      InvestmentPublishDialogComponent,
      expect.objectContaining({ data: rateFixture })
    );
    expect(service.publishRate).not.toHaveBeenCalled();
    confirmed.next(true);
    confirmed.complete();
    expect(service.publishRate).toHaveBeenCalledTimes(1);
    expect(service.publishRate).toHaveBeenCalledWith(41, 1);
    expect(service.getRateDraft).toHaveBeenCalledTimes(2);
    expect(component.form.disabled).toBe(true);
    expect(component.message()).toBe('Investment.published');
  });
  it('blocks publication after validation rejects a pristine draft without blocker codes', () => {
    const component = rates();
    expect(component.canPublish).toBe(true);
    service.validateRateDraft.mockReturnValueOnce(of({ valid: false, blockers: [] }));
    component.submit(false);
    expect(component.error()).toBe('Investment.validationFailed');
    expect(component.canPublish).toBe(false);
    component.publish();
    expect(service.publishRate).not.toHaveBeenCalled();

    component.submit(false);
    expect(component.canPublish).toBe(true);
    service.validateRateDraft.mockReturnValueOnce(of({ valid: false, blockers: [] }));
    component.submit(false);
    component.refresh();
    expect(component.canPublish).toBe(true);
  });
  it('retries rate validation after an outage and locks if the following save outcome is uncertain', () => {
    const outage = throwError(() => new HttpErrorResponse({ status: 503 }));
    service.validateRateDraft.mockReturnValueOnce(outage);
    service.saveRateDraft.mockReturnValueOnce(outage);
    const component = rates();
    component.matrix.controls.rates.at(0).at(0).setValue('7.125');
    component.matrix.markAsDirty();
    const payload = component.payload();

    component.submit(true);
    expect(service.saveRateDraft).not.toHaveBeenCalled();
    expect(component.conflict()).toBe(false);
    expect(component.dirty).toBe(true);

    component.submit(true);
    expect(service.validateRateDraft).toHaveBeenLastCalledWith(41, payload);
    expect(service.saveRateDraft).toHaveBeenCalledWith(41, payload);
    expect(component.conflict()).toBe(true);
    component.submit(true);
    expect(service.saveRateDraft).toHaveBeenCalledTimes(1);
  });
  it('shows backend publication blockers', () => {
    service.publishRate.mockReturnValue(
      throwError(
        () => new HttpErrorResponse({ status: 422, error: { blockers: ['SCHEDULE_MUST_BE_FUTURE_TENANT_DATE'] } })
      )
    );
    const component = rates();
    component.publish();
    expect(component.error()).toBe('Investment.publicationBlocked');
    expect(component.blockers()).toContain('SCHEDULE_MUST_BE_FUTURE_TENANT_DATE');
    expect(component.canPublish).toBe(false);
    component.publish();
    expect(service.publishRate).toHaveBeenCalledTimes(1);
    service.validateRateDraft.mockReturnValueOnce(of({ valid: false, blockers: [] }));
    component.submit(false);
    expect(component.canPublish).toBe(false);
    component.submit(false);
    expect(component.canPublish).toBe(true);
  });
  it('rejects an enabled campaign without a configured type', () => {
    const component = rates();
    component.form.patchValue({
      campaignEnabled: true,
      campaignId: 'DEMO',
      campaignName: 'Demo',
      startDate: '2026-12-10',
      endDate: '2026-12-11'
    });
    component.submit(true);
    expect(component.issues()).toContain('Investment.campaignRules');
    expect(service.validateRateDraft).not.toHaveBeenCalled();
  });
  it('blocks campaigns and dirty form publication', () => {
    const component = rates();
    component.matrix.markAsDirty();
    expect(component.canPublish).toBe(false);
    component.matrix.markAsPristine();
    component.draft.set({ ...rateFixture, blockers: ['CAMPAIGN_APPLICABILITY_AND_PRECEDENCE_UNAPPROVED'] });
    expect(component.canPublish).toBe(false);
  });
  it('handles an unavailable rate plugin without enabling commands', () => {
    service.getRateTemplate.mockReturnValue(throwError(() => new HttpErrorResponse({ status: 404 })));
    const component = rates();
    expect(component.template()).toBeNull();
    expect(component.canManage).toBe(false);
    expect(component.error()).toBe('Investment.notFound');
  });
  it('never grants financial execution from published pricing', () =>
    expect(rates().template().capabilities.financialExecutionSupported).toBe(false));
  it('does not request rate configuration without read permission', () => {
    access.has.mockReturnValue(false);
    rates();
    expect(service.getRateTemplate).not.toHaveBeenCalled();
  });
  it('initializes policy forms with reinvestment and cancellation metadata', () => {
    const component = TestBed.createComponent(InvestmentPolicyEditorComponent).componentInstance;
    component.ngOnInit();
    expect(component.payload().policy).toEqual(configurationFixture.policy);
    expect(component.blockers()).toContain('FINANCIAL_EXECUTION_UNAVAILABLE');
  });
  it('validates policy before saving and preserves the draft-only status', () => {
    const navigate = jest.spyOn(TestBed.inject(Router), 'navigate').mockResolvedValue(true);
    service.validateInvestmentConfiguration.mockReturnValue(of({ ...configurationFixture }));
    service.saveInvestmentConfiguration.mockReturnValue(of({ ...configurationFixture, revision: 2 }));
    const component = TestBed.createComponent(InvestmentPolicyEditorComponent).componentInstance;
    component.ngOnInit();
    component.submit(true);
    expect(service.validateInvestmentConfiguration).toHaveBeenCalled();
    expect(service.saveInvestmentConfiguration).toHaveBeenCalled();
    expect(component.config().status).toBe('DRAFT');
    expect(navigate).toHaveBeenCalledWith([
      '/products/investment-products',
      41
    ]);
  });
  it('preserves term limits in a read-only policy and disables both controls', () => {
    const limit = { termDays: 60, maximumReinvestments: 2 };
    service.getInvestmentConfiguration.mockReturnValue(
      of({
        ...configurationFixture,
        capabilities: { ...configurationFixture.capabilities, configurationSupported: false },
        policy: {
          ...configurationFixture.policy,
          automaticReinvestmentEnabled: true,
          maximumReinvestmentsByTerm: [limit]
        }
      })
    );
    const fixture = TestBed.createComponent(InvestmentPolicyEditorComponent);
    fixture.detectChanges();
    const component = fixture.componentInstance;
    const buttons = Array.from<HTMLButtonElement>(fixture.nativeElement.querySelectorAll('button'));
    expect(buttons.find((button) => button.textContent.trim() === 'Add')?.disabled).toBe(true);
    expect(buttons.find((button) => button.textContent.trim() === 'Remove 1')?.disabled).toBe(true);

    component.addLimit();
    component.removeLimit(0);
    expect(component.limits.getRawValue()).toEqual([limit]);
    expect(component.dirty).toBe(false);
  });
  it('retries policy validation after an outage and locks if the following save outcome is uncertain', () => {
    const outage = throwError(() => new HttpErrorResponse({ status: 503 }));
    service.validateInvestmentConfiguration.mockReturnValueOnce(outage).mockReturnValueOnce(of(configurationFixture));
    service.saveInvestmentConfiguration.mockReturnValueOnce(outage);
    const component = TestBed.createComponent(InvestmentPolicyEditorComponent).componentInstance;
    component.ngOnInit();
    component.form.controls.maximumInvestmentAmount.setValue('90000');
    component.form.markAsDirty();
    const payload = component.payload();

    component.submit(true);
    expect(service.saveInvestmentConfiguration).not.toHaveBeenCalled();
    expect(component.conflict()).toBe(false);
    expect(component.dirty).toBe(true);

    component.submit(true);
    expect(service.validateInvestmentConfiguration).toHaveBeenLastCalledWith(41, payload);
    expect(service.saveInvestmentConfiguration).toHaveBeenCalledWith(41, payload);
    expect(component.conflict()).toBe(true);
    component.submit(true);
    expect(service.saveInvestmentConfiguration).toHaveBeenCalledTimes(1);
  });
  it('lets policies save with hidden incomplete limits and restores validation on reenable', () => {
    service.validateInvestmentConfiguration.mockReturnValue(of(configurationFixture));
    const component = TestBed.createComponent(InvestmentPolicyEditorComponent).componentInstance;
    component.ngOnInit();
    const reinvestment = component.form.get('automaticReinvestmentEnabled');
    reinvestment.setValue(true);
    component.addLimit();
    expect(component.form.invalid).toBe(true);
    component.submit(false);
    expect(component.issues()).toContain('Investment.renewalRules');
    expect(service.validateInvestmentConfiguration).not.toHaveBeenCalled();
    reinvestment.setValue(false);
    expect(component.form.valid).toBe(true);
    component.submit(false);
    expect(service.validateInvestmentConfiguration).toHaveBeenCalledWith(41, component.payload());
    expect(component.payload().policy.maximumReinvestmentsByTerm).toEqual([]);
    expect(component.limits.disabled).toBe(true);
    reinvestment.setValue(true);
    expect(component.form.invalid).toBe(true);
  });
  it('restores unconfigured defaults after discard and preserves nullable weekly terms', () => {
    service.getInvestmentConfiguration.mockReturnValue(
      of({
        ...configurationFixture,
        policy: null,
        nativeProduct: {
          ...configurationFixture.nativeProduct,
          terms: { minimum: 2, minimumUnit: 1, maximum: null, maximumUnit: 1, multiple: null, multipleUnit: 1 }
        }
      })
    );
    const component = TestBed.createComponent(InvestmentPolicyEditorComponent).componentInstance;
    component.ngOnInit();
    component.form.patchValue({ investmentType: 'CEDE', earlyCancellationAllowed: true, policyCode: 'EDITED' });
    component.form.markAsDirty();
    component.refresh();
    expect(component.form.pristine).toBe(true);
    expect(component.form.getRawValue()).toEqual(
      expect.objectContaining({
        investmentType: '',
        earlyCancellationAllowed: false,
        policyCode: '',
        minimumTermDays: 14,
        maximumTermDays: policyTemplateFixture.promissoryNoteMaximumTermDays,
        termMultipleDays: 1
      })
    );
  });
  it('filters classification using policy values rather than product names', () => {
    const component = TestBed.createComponent(InvestmentProductsComponent).componentInstance;
    const native = { id: 41, name: 'CEDE named product' };
    expect(
      component.source.filterPredicate(
        { native, configuration: configurationFixture },
        JSON.stringify({ search: '', type: 'CEDE' })
      )
    ).toBe(false);
    expect(
      component.source.filterPredicate(
        { native, configuration: { ...configurationFixture, status: 'UNCONFIGURED', policy: null } },
        JSON.stringify({ search: '', type: 'UNCONFIGURED' })
      )
    ).toBe(true);
  });
  it('renders translated empty state without fabricating products', () => {
    const fixture = TestBed.createComponent(InvestmentProductsComponent);
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('Investment Products');
    expect(fixture.nativeElement.textContent).toContain('No matching native fixed-deposit products.');
  });
  it('uses backend selection without calculating a return', () => {
    service.selectRate.mockReturnValue(
      of({ status: 'SELECTED_CONFIGURATION_ONLY', annualRatePercent: '7.125', blockers: [] })
    );
    const component = TestBed.createComponent(InvestmentRateLookupComponent).componentInstance;
    component.productId = 41;
    component.template = rateTemplateFixture;
    component.form.patchValue({ amount: '1000.10', termDays: 60 });
    component.lookup();
    expect(service.selectRate).toHaveBeenCalledWith(41, { amount: '1000.10', termDays: 60 });
    expect(component.selection().status).toBe('SELECTED_CONFIGURATION_ONLY');
  });
  it.each([
    '2026-02-30T00:00:00Z',
    '2026-01-01T24:00:00Z',
    '2026-01-01T05:00:00+25:00'
  ])('rejects invalid lookup instant %s', (asOfInstant) => {
    const component = TestBed.createComponent(InvestmentRateLookupComponent).componentInstance;
    component.template = rateTemplateFixture;
    component.form.patchValue({ amount: '1000', termDays: 60, asOfInstant });
    component.lookup();
    expect(service.selectRate).not.toHaveBeenCalled();
    expect(component.error()).toBe('Investment.lookupRules');
  });
  it('clears past lookup results and cancels pending requests when the query changes', () => {
    const result = { status: 'SELECTED_CONFIGURATION_ONLY', annualRatePercent: '7.125' };
    const pending = new Subject();
    service.selectRate.mockReturnValueOnce(of(result)).mockReturnValueOnce(pending);
    const component = TestBed.createComponent(InvestmentRateLookupComponent).componentInstance;
    component.productId = 41;
    component.template = rateTemplateFixture;
    const asOfInstant = '2028-02-29T23:00:00.123456789-02:00';
    component.form.patchValue({ amount: '1000', termDays: 60, asOfInstant });
    component.lookup();
    expect(service.selectRate).toHaveBeenCalledWith(41, { amount: '1000', termDays: 60, asOfInstant });
    expect(component.selection()).toEqual(result);
    component.form.controls.amount.setValue('100');
    expect(component.selection()).toBeNull();
    component.lookup();
    component.form.controls.amount.setValue('invalid');
    expect(pending.observed).toBe(false);
    pending.next(result);
    expect(component.loading()).toBe(false);
    expect(component.selection()).toBeNull();
    component.lookup();
    expect(service.selectRate).toHaveBeenCalledTimes(2);
    expect(component.error()).toBe('Investment.lookupRules');
  });
  it('ignores versionless rows and cancels inspections on a replacement history request', () => {
    const inspection = new Subject();
    const replacement = new Subject();
    service.getRateVersion.mockReturnValue(inspection);
    service.getRateSchedule.mockReturnValue(replacement);
    const component = TestBed.createComponent(InvestmentHistoryComponent).componentInstance;
    component.productId = 41;
    component.ngOnInit();
    component.inspect(null);
    expect(service.getRateVersion).not.toHaveBeenCalled();
    component.inspect(1);
    expect(inspection.observed).toBe(true);
    component.filter.setValue('schedule');
    expect(inspection.observed).toBe(false);
    inspection.next(rateFixture);
    expect(component.selected()).toBeNull();
    expect(component.loading()).toBe(true);
    replacement.next([]);
    expect(component.loading()).toBe(false);
  });
  it('loads scheduled versions and historical snapshots from dedicated endpoints', () => {
    service.getRateVersion.mockReturnValue(of({ ...rateFixture, version: 1, status: 'SUPERSEDED' }));
    const component = TestBed.createComponent(InvestmentHistoryComponent).componentInstance;
    component.productId = 41;
    component.ngOnInit();
    component.filter.setValue('schedule');
    expect(service.getRateSchedule).toHaveBeenCalledWith(41, 0, 25);
    component.inspect(1);
    expect(component.selected().status).toBe('SUPERSEDED');
  });
});
