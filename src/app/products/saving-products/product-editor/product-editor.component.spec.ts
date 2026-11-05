/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { ChangeDetectorRef, SimpleChange } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { FormBuilder } from '@angular/forms';
import { ActivatedRoute, Router, convertToParamMap } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { of, Subject, throwError } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';
import { AuthenticationService } from 'app/core/authentication/authentication.service';
import { Accounting } from 'app/core/utils/accounting';
import { SettingsService } from 'app/settings/settings.service';
import { ProductsService } from 'app/products/products.service';
import { ProductPolicyService } from './product-policy.service';
import { ProductEditorComponent } from './product-editor.component';
import { PolicyWorkflowComponent } from './policy-workflow.component';
import { productEditorGuard } from './product-editor.guard';
import {
  CreateSavingProductComponent,
  CoreCreateSavingProductComponent
} from '../create-saving-product/create-saving-product.component';
import {
  EditSavingProductComponent,
  CoreEditSavingProductComponent
} from '../edit-saving-product/edit-saving-product.component';
import { policy, capabilities } from './product-policy.fixtures';

const configuration = { savingsProductId: 42, revision: 7, status: 'DRAFT', operational: false, policy, capabilities };
describe('Savings product editor orchestration', () => {
  let editor: ProductEditorComponent, api: any, products: any, router: any, permissions: string[];
  beforeEach(() => {
    permissions = ['ALL_FUNCTIONS'];
    api = {
      template: jest.fn(() => of(capabilities)),
      fees: jest.fn(() => of([])),
      configuration: jest.fn(() => of({ ...configuration, revision: null, status: 'UNCONFIGURED', policy: null })),
      save: jest.fn((_id, revision, savedPolicy) => {
        api.configuration.mockReturnValue(of({ ...configuration, revision: revision + 1, policy: savedPolicy }));
        return of({ revision: revision + 1 });
      })
    };
    products = { createSavingProduct: jest.fn(() => of({ resourceId: 42 })), updateSavingProduct: jest.fn() };
    router = { navigate: jest.fn() };
    TestBed.configureTestingModule({
      providers: [
        { provide: ChangeDetectorRef, useValue: { markForCheck: jest.fn() } },
        { provide: ProductPolicyService, useValue: api },
        { provide: ProductsService, useValue: products },
        { provide: Router, useValue: router },
        { provide: ActivatedRoute, useValue: {} },
        { provide: TranslateService, useValue: { instant: (s: string) => s } },
        { provide: SettingsService, useValue: { language: { code: 'en' } } },
        { provide: AuthenticationService, useValue: { getCredentials: () => ({ permissions, userId: 1 }) } },
        { provide: Accounting, useValue: { getAccountingRulesForSavings: (): string[] => [] } }
      ]
    });
    editor = TestBed.runInInjectionContext(() => new ProductEditorComponent());
    editor.template = {};
    const fb = new FormBuilder();
    editor.details = {
      savingProductDetailsForm: fb.group({ name: ['Product'], shortName: ['NEW'] }),
      savingProductDetails: { name: 'Product', shortName: 'NEW' }
    } as any;
    editor.currency = {
      savingProductCurrencyForm: fb.group({ currencyCode: ['MXN'], digitsAfterDecimal: [2] }),
      savingProductCurrency: { currencyCode: 'MXN', digitsAfterDecimal: 2 }
    } as any;
    editor.terms = {
      savingProductTermsForm: fb.group({ nominalAnnualInterestRate: [0] }),
      savingProductTerms: { nominalAnnualInterestRate: 0 }
    } as any;
    editor.settings = {
      savingProductSettingsForm: fb.group({ minRequiredOpeningBalance: [0] }),
      savingProductSettings: { minRequiredOpeningBalance: 0 }
    } as any;
    editor.accounting = {
      savingProductAccountingForm: fb.group({ accountingRule: [1] }),
      savingProductAccounting: { accountingRule: 1, advancedAccountingRules: false }
    } as any;
    editor.charges = {
      pristine: true,
      savingProductCharges: { charges: [{ id: 5, name: 'Preserved charge' }] }
    } as any;
    editor.ngOnInit();
    editor.ngAfterViewInit();
    editor.policy.patchValue(policy);
    editor.policy.markAsDirty();
    editor.workflow = { loaded: true, pending: false } as any;
  });
  it('requires confirmation before clearing an incompatible saved matrix on a mode change', () => {
    editor.policy.controls.interestMode.setValue('TIERED');
    editor.changeInterestMode('TIERED');
    const matrix = {
      calculationMethod: 'UNAPPROVED',
      brackets: [{ lowerBalance: '0', upperBalance: null as string | null, annualRatePercent: '1' }]
    } as const;
    editor.policy.controls.interestMatrix.setValue(matrix as any);
    jest.spyOn(window, 'confirm').mockReturnValueOnce(false);
    editor.policy.controls.interestMode.setValue('FIXED');
    editor.changeInterestMode('FIXED');
    expect(editor.policy.controls.interestMode.value).toBe('TIERED');
    expect(editor.policy.controls.interestMatrix.value).toEqual(matrix);
    jest.spyOn(window, 'confirm').mockReturnValueOnce(true);
    editor.policy.controls.interestMode.setValue('FIXED');
    editor.changeInterestMode('FIXED');
    expect(editor.policy.controls.interestMatrix.value).toBeNull();
    expect(editor.policy.controls.accountDesignation.value).toBe(policy.accountDesignation);
  });
  it('blocks old parent saves and policy submission while an advanced editor has unsaved input', () => {
    editor.interest = { dirty: true, saving: false } as any;
    expect(editor.saveDisabled).toBe(true);
    expect(editor.dirty).toBe(true);
    editor.save();
    expect(api.save).not.toHaveBeenCalled();
  });
  it('creates the core product, obtains initial revision from the server and saves the exact returned ID', () => {
    editor.save();
    expect(products.createSavingProduct).toHaveBeenCalledTimes(1);
    expect(api.configuration).toHaveBeenCalledWith(42);
    expect(api.save).toHaveBeenCalledWith(42, 0, policy);
    expect(router.navigate).toHaveBeenCalledWith([
      '/products/saving-products',
      42,
      'edit'
    ]);
    expect(products.createSavingProduct.mock.calls[0][0]).toMatchObject({ charges: [{ id: 5 }], accountingRule: 1 });
    expect(products.createSavingProduct.mock.calls[0][0]).not.toHaveProperty('advancedAccountingRules');
  });
  it('waits for authoritative readback after a partial PUT response before resetting the form', () => {
    editor.template = { id: 42, currency: { code: 'MXN', decimalPlaces: 2 }, nominalAnnualInterestRate: 0 };
    editor.configuration = configuration as any;
    api.save.mockReturnValue(of({ revision: 8 }));
    const readback = new Subject();
    api.configuration.mockReturnValue(readback);
    editor.save();
    expect(api.configuration).toHaveBeenCalledWith(42);
    expect(editor.busy).toBe(true);
    expect(editor.policy.dirty).toBe(true);
    expect(editor.notice).not.toBe('SavingsEditor.DraftSaved');
    const authoritativePolicy = { ...policy, accountDesignation: 'Server configuration' };
    readback.next({ ...configuration, revision: 8, policy: authoritativePolicy });
    readback.complete();
    expect(editor.configuration.revision).toBe(8);
    expect(editor.policy.getRawValue()).toEqual(authoritativePolicy);
    expect(editor.policy.pristine).toBe(true);
    expect(editor.busy).toBe(false);
  });
  it('preserves input when a successful PUT cannot be read back', () => {
    editor.template = { id: 42, currency: { code: 'MXN', decimalPlaces: 2 }, nominalAnnualInterestRate: 0 };
    editor.configuration = configuration as any;
    api.save.mockReturnValue(of({ revision: 8 }));
    api.configuration.mockReturnValue(throwError(() => new HttpErrorResponse({ status: 503 })));
    editor.save();
    expect(editor.configuration.revision).toBe(7);
    expect(editor.policy.getRawValue()).toEqual(policy);
    expect(editor.policy.dirty).toBe(true);
    expect(editor.notice).not.toBe('SavingsEditor.DraftSaved');
    expect(editor.error).toBe('SavingsEditor.RequestFailed');
  });
  it('retains a created ID after policy failure and retries only that resource', () => {
    api.save.mockReturnValueOnce(throwError(() => new HttpErrorResponse({ status: 503 })));
    editor.save();
    expect(editor.createdId).toBe(42);
    expect(editor.notice).toBe('SavingsEditor.PartialFailure');
    expect(editor.policy.dirty).toBe(true);
    editor.save();
    expect(products.createSavingProduct).toHaveBeenCalledTimes(1);
    expect(api.save).toHaveBeenCalledTimes(2);
  });
  it('blocks duplicate submits while the core request is pending', () => {
    const request = new Subject();
    products.createSavingProduct.mockReturnValue(request);
    editor.save();
    editor.save();
    expect(products.createSavingProduct).toHaveBeenCalledTimes(1);
    request.next({ resourceId: 42 });
    request.complete();
  });
  it('edits only a policy using its loaded revision and preserves core settings', () => {
    editor.template = {
      id: 42,
      currency: { code: 'MXN', decimalPlaces: 2 },
      minRequiredOpeningBalance: 0,
      nominalAnnualInterestRate: 0
    };
    editor.configuration = configuration as any;
    editor.save();
    expect(api.save).toHaveBeenCalledWith(42, 7, policy);
    expect(products.createSavingProduct).not.toHaveBeenCalled();
    expect(products.updateSavingProduct).not.toHaveBeenCalled();
    expect(editor.configuration.revision).toBe(8);
  });
  it('keeps user input and blocks writes on 409 without silently fetching a replacement revision', () => {
    editor.configuration = configuration as any;
    editor.template = { id: 42, currency: { code: 'MXN', decimalPlaces: 2 }, nominalAnnualInterestRate: 0 };
    api.save.mockReturnValue(throwError(() => new HttpErrorResponse({ status: 409 })));
    editor.save();
    expect(editor.conflict).toBe(true);
    expect(editor.policy.getRawValue()).toMatchObject(policy);
    expect(editor.saveDisabled).toBe(true);
    expect(api.configuration).not.toHaveBeenCalled();
  });
  it('handles native staged creation without inventing an ID or creating a policy', () => {
    products.createSavingProduct.mockReturnValue(of({ commandId: 123 }));
    editor.save();
    expect(api.save).not.toHaveBeenCalled();
    expect(editor.conflict).toBe(true);
    expect(editor.createdId).toBeNull();
  });
  it('blocks read-only users and pending drafts', () => {
    permissions = ['READ_SAVINGS_PRODUCT_POLICY'];
    editor.save();
    expect(products.createSavingProduct).not.toHaveBeenCalled();
    permissions = ['ALL_FUNCTIONS'];
    editor.workflow = { loaded: true, pending: true } as any;
    expect(editor.saveDisabled).toBe(true);
  });
  it('changes only nominal rate and policy interest mode when explicitly selecting no interest', () => {
    const core = editor.currency.savingProductCurrencyForm.getRawValue();
    editor.zeroInterest();
    expect(editor.terms.savingProductTermsForm.get('nominalAnnualInterestRate').value).toBe(0);
    expect(editor.policy.controls.interestMode.value).toBe('NONE');
    expect(editor.currency.savingProductCurrencyForm.getRawValue()).toEqual(core);
  });
});

describe('Policy authorization state and permissions', () => {
  let workflow: PolicyWorkflowComponent, api: any, permissions: string[];
  beforeEach(() => {
    permissions = ['ALL_FUNCTIONS'];
    api = {
      versions: jest.fn(() => of([])),
      active: jest.fn(() => of(null)),
      audit: jest.fn(() => of([])),
      businessDate: jest.fn(() => of('2026-11-03')),
      submit: jest.fn(() => of({})),
      review: jest.fn(() => of({})),
      decide: jest.fn(() => of({}))
    };
    TestBed.configureTestingModule({
      providers: [
        { provide: ChangeDetectorRef, useValue: { markForCheck: jest.fn() } },
        { provide: ProductPolicyService, useValue: api },
        { provide: AuthenticationService, useValue: { getCredentials: () => ({ permissions, userId: 1 }) } }
      ]
    });
    workflow = TestBed.runInInjectionContext(() => new PolicyWorkflowComponent());
    workflow.configuration = configuration as any;
    workflow.load();
    workflow.form.controls.effectiveDate.setValue('2026-11-04');
  });
  it('submits the current revision and explicit date, then refreshes real history', () => {
    expect(workflow.canSubmit).toBe(true);
    workflow.submit();
    expect(api.submit).toHaveBeenCalledWith(42, 7, '2026-11-04');
    expect(api.versions).toHaveBeenCalledTimes(2);
  });
  it('does not submit unsaved, stale-date, pending or already submitted revisions', () => {
    workflow.unsaved = true;
    expect(workflow.canSubmit).toBe(false);
    workflow.unsaved = false;
    workflow.form.controls.effectiveDate.setValue('2026-11-02');
    expect(workflow.canSubmit).toBe(false);
    workflow.form.controls.effectiveDate.setValue('2026-11-04');
    workflow.versions = [{ version: 7, status: 'REJECTED' } as any];
    expect(workflow.canSubmit).toBe(false);
  });
  it('never labels a future approved version active when active returns 204', () => {
    api.versions.mockReturnValue(of([{ version: 6, status: 'APPROVED', effectiveDate: '2026-11-05' }]));
    workflow.load();
    expect(workflow.active).toBeNull();
    expect(workflow.versions[0].status).toBe('APPROVED');
  });
  it('requires checker permission and excludes the submitting actor', () => {
    const v = { makerId: 1, status: 'PENDING_APPROVAL' } as any;
    expect(workflow.canCheck(v)).toBe(false);
    v.makerId = 2;
    expect(workflow.canCheck(v)).toBe(true);
    permissions = ['READ_SAVINGS_PRODUCT_POLICY'];
    expect(workflow.canCheck(v)).toBe(false);
    expect(workflow.canSubmit).toBe(false);
  });
  it('displays backend self-approval and revision failures without changing input', () => {
    workflow.failed(
      new HttpErrorResponse({ status: 403, error: { defaultUserMessage: 'Contributor may not approve' } })
    );
    expect(workflow.error).toBe('SavingsEditor.Denied');
    expect(workflow.details).toEqual(['Contributor may not approve']);
    workflow.failed(new HttpErrorResponse({ status: 409 }));
    expect(workflow.error).toBe('SavingsEditor.Conflict');
  });
  it('requires rejection reason and uses only the reviewed version', () => {
    workflow.review = { proposed: { savingsProductId: 42, version: 8, makerId: 2, status: 'PENDING_APPROVAL' } } as any;
    workflow.decide(false);
    expect(api.decide).not.toHaveBeenCalled();
    workflow.form.controls.reason.setValue('Invalid configuration');
    workflow.decide(false);
    expect(api.decide).toHaveBeenCalledWith(42, 8, false, 'Invalid configuration');
  });
  it('marks empty rejection reasons touched and still allows approval without a reason', () => {
    workflow.review = { proposed: { savingsProductId: 42, version: 8, makerId: 2, status: 'PENDING_APPROVAL' } } as any;
    workflow.decide(false);
    expect(workflow.form.controls.reason.hasError('required')).toBe(true);
    expect(workflow.form.controls.reason.touched).toBe(true);
    expect(api.decide).not.toHaveBeenCalled();
    workflow.decide(true);
    expect(api.decide).toHaveBeenCalledWith(42, 8, true, '');
    expect(workflow.form.controls.reason.valid).toBe(true);
  });
  it.each([
    'x'.repeat(1001),
    '\u0001'
  ])('still validates optional approval reason content', (reason) => {
    workflow.review = { proposed: { savingsProductId: 42, version: 8, makerId: 2, status: 'PENDING_APPROVAL' } } as any;
    workflow.form.controls.reason.setValue(reason);
    workflow.decide(true);
    expect(api.decide).not.toHaveBeenCalled();
    expect(workflow.form.controls.reason.invalid).toBe(true);
    expect(workflow.form.controls.reason.touched).toBe(true);
  });
  it.each([
    'submit',
    'approve',
    'reject'
  ])('keeps %s busy until its history reload completes', (action) => {
    const mutation = new Subject();
    const history = new Subject();
    api.versions.mockReturnValue(history);
    api.submit.mockReturnValue(mutation);
    api.decide.mockReturnValue(mutation);
    workflow.review = { proposed: { savingsProductId: 42, version: 8, makerId: 2, status: 'PENDING_APPROVAL' } } as any;
    workflow.form.controls.reason.setValue('Independent review');
    workflow.refreshed.subscribe(() =>
      workflow.ngOnChanges({ configuration: new SimpleChange(configuration, { ...configuration }, false) })
    );
    if (action === 'submit') workflow.submit();
    else workflow.decide(action === 'approve');
    mutation.next({});
    expect(workflow.busy).toBe(true);
    expect(api.versions).toHaveBeenCalledTimes(1);
    mutation.complete();
    expect(workflow.busy).toBe(true);
    expect(workflow.loaded).toBe(false);
    expect(api.versions).toHaveBeenCalledTimes(2);
    // A parent refresh and another click cannot start a concurrent load.
    workflow.ngOnChanges({ configuration: new SimpleChange(configuration, { ...configuration }, false) });
    workflow.load();
    workflow.inspect(workflow.review?.proposed);
    expect(api.versions).toHaveBeenCalledTimes(2);
    expect(api.review).not.toHaveBeenCalled();
    history.next([]);
    expect(workflow.busy).toBe(true);
    history.complete();
    expect(workflow.busy).toBe(false);
    expect(workflow.loaded).toBe(true);
  });
});

describe.each([
  [
    'create',
    CoreCreateSavingProductComponent,
    CreateSavingProductComponent
  ],
  [
    'edit',
    CoreEditSavingProductComponent,
    EditSavingProductComponent
  ]
] as const)('native %s editor unsaved changes', (_mode, Core, Host) => {
  let core: CoreCreateSavingProductComponent | CoreEditSavingProductComponent;
  let host: CreateSavingProductComponent | EditSavingProductComponent;
  let confirm: jest.SpyInstance;
  let router: { navigate: jest.Mock };
  beforeEach(() => {
    const query = convertToParamMap({ core: '1' });
    const data = { savingProductsTemplate: {}, savingProductAndTemplate: { id: 42 } };
    router = { navigate: jest.fn() };
    TestBed.configureTestingModule({
      providers: [
        {
          provide: ActivatedRoute,
          useValue: { data: of(data), queryParamMap: of(query), snapshot: { data, queryParamMap: query } }
        },
        {
          provide: ProductsService,
          useValue: {
            createSavingProduct: jest.fn(() => of({ resourceId: 42 })),
            updateSavingProduct: jest.fn(() => of({ resourceId: 42 }))
          }
        },
        { provide: Router, useValue: router },
        { provide: SettingsService, useValue: { language: { code: 'en' } } },
        { provide: Accounting, useValue: { getAccountingRulesForSavings: (): string[] => [] } },
        { provide: TranslateService, useValue: { instant: () => 'Discard unsaved changes?' } }
      ]
    });
    core = TestBed.runInInjectionContext(() => new Core());
    const fb = new FormBuilder();
    for (const step of [
      'Details',
      'Currency',
      'Terms',
      'Settings',
      'Accounting'
    ]) {
      (core as any)['savingProduct' + step + 'Step'] = {
        ['savingProduct' + step + 'Form']: fb.group({ value: ['Persisted'] })
      };
    }
    core.savingProductChargesStep = { pristine: true, savingProductCharges: { charges: [] } } as any;
    host = TestBed.runInInjectionContext(() => new Host());
    (host as { core: typeof core }).core = core;
    confirm = jest.spyOn(window, 'confirm').mockReturnValue(false);
  });
  afterEach(() => confirm.mockRestore());
  const canLeave = (component: unknown): boolean =>
    TestBed.runInInjectionContext(() =>
      productEditorGuard(component as any, {} as any, {} as any, {} as any)
    ) as boolean;
  it.each([
    0,
    1,
    2,
    3,
    4
  ])('protects unsaved core form %s when returning to unified mode', (index) => {
    core.coreForms[index].markAsDirty();
    expect(canLeave(host)).toBe(false);
    expect(confirm).toHaveBeenCalledWith('Discard unsaved changes?');
    expect(core.coreForms[index].dirty).toBe(true);
    confirm.mockReturnValue(true);
    expect(canLeave(host)).toBe(true);
  });
  it('protects charge-only edits', () => {
    core.savingProductChargesStep.pristine = false;
    expect(canLeave(host)).toBe(false);
  });
  it('allows pristine forms and successful saves without a discard prompt', () => {
    expect(canLeave(host)).toBe(true);
    core.coreForms.forEach((form) => form.markAsDirty());
    core.savingProductChargesStep.pristine = false;
    core.submit();
    expect(core.dirty).toBe(false);
    expect(router.navigate).toHaveBeenCalled();
    expect(canLeave(host)).toBe(true);
    expect(confirm).not.toHaveBeenCalled();
  });
  it('retains unified editor protection while a save is running', () => {
    const saving = { editor: { busy: true, dirty: false } };
    expect(canLeave(saving)).toBe(false);
    expect(confirm).not.toHaveBeenCalled();
  });
});
