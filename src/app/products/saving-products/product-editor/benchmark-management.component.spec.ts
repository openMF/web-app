/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { ChangeDetectorRef } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { of, Subject, throwError } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';
import { TranslateService } from '@ngx-translate/core';
import { AuthenticationService } from 'app/core/authentication/authentication.service';
import { ProductPolicyService } from './product-policy.service';
import { ReferenceRateService } from './reference-rate.service';
import { BenchmarkManagementComponent } from './benchmark-management.component';

describe('Independent benchmark capture and authorization', () => {
  let c: BenchmarkManagementComponent, api: any, permissions: string[], userId: number;
  const definition = { referenceId: 'CETES_TEST', referenceType: 'CETES', tenor: 'D28', revision: 9 };
  const fixing = {
    ...definition,
    version: 10,
    revision: 0,
    status: 'DRAFT',
    annualRatePercent: '1.000000000001',
    makerId: 1,
    submitterId: 1,
    effectiveDate: '2026-11-09'
  };
  beforeEach(() => {
    permissions = ['ALL_FUNCTIONS'];
    userId = 1;
    api = {
      template: jest.fn(() => of({ formulaModes: ['ADDITIVE_SPREAD'] })),
      definitions: jest.fn(() => of([definition])),
      definition: jest.fn(() => of(definition)),
      history: jest.fn(() => of([fixing])),
      audit: jest.fn(() => of([])),
      define: jest.fn(() => of(definition)),
      capture: jest.fn(() => of(fixing)),
      action: jest.fn(() => of({})),
      effective: jest.fn(() => of({ ...fixing, status: 'APPROVED' }))
    };
    TestBed.configureTestingModule({
      providers: [
        { provide: ChangeDetectorRef, useValue: { markForCheck: jest.fn() } },
        { provide: ReferenceRateService, useValue: api },
        { provide: ProductPolicyService, useValue: { businessDate: () => of('2026-11-06') } },
        { provide: AuthenticationService, useValue: { getCredentials: () => ({ permissions, userId }) } },
        { provide: TranslateService, useValue: { instant: (s: string) => s } }
      ]
    });
    c = TestBed.runInInjectionContext(() => new BenchmarkManagementComponent());
    c.ngOnInit();
    c.selection.controls.referenceId.setValue('CETES_TEST');
    c.select();
    c.capture.patchValue({
      annualRatePercent: '1.000000000001',
      publicationDate: '2026-11-03',
      effectiveDate: '2026-11-09',
      sourceReference: 'Explicit contract test fixture'
    });
  });
  it('captures using the selected definition revision and tenor, with no trusted actor fields', () => {
    c.capture.markAsDirty();
    c.captureFixing();
    expect(api.capture).toHaveBeenCalledWith(
      'CETES_TEST',
      expect.objectContaining({ expectedRevision: 9, tenor: 'D28', annualRatePercent: '1.000000000001' })
    );
    expect(api.capture.mock.calls[0][1]).not.toHaveProperty('makerId');
    expect(c.capture.pristine).toBe(true);
    expect(c.notice).toBe('InterestManagement.CapturedDraft');
  });
  it.each([
    [
      'annualRatePercent',
      '-1'
    ],
    [
      'annualRatePercent',
      '1e2'
    ],
    [
      'annualRatePercent',
      '1.1234567890123'
    ],
    [
      'sourceReference',
      ''
    ],
    [
      'publicationDate',
      '2026-11-07'
    ],
    [
      'effectiveDate',
      '2026-11-05'
    ],
    [
      'effectiveDate',
      '2026-02-30'
    ]
  ])('rejects invalid capture %s=%s', (field, value) => {
    c.capture.get(field).setValue(value);
    c.captureFixing();
    expect(c.captureValid).toBeFalsy();
    expect(api.capture).not.toHaveBeenCalled();
  });
  it('requires authoritative business date and capture permission', () => {
    c.businessDate = null;
    expect(c.captureValid).toBeFalsy();
    c.businessDate = '2026-11-06';
    permissions = ['READ_SAVINGS_REFERENCE_RATE'];
    c.captureFixing();
    expect(api.capture).not.toHaveBeenCalled();
  });
  it('uses immutable tenant definitions and rejects invalid identifiers', () => {
    c.definition.patchValue({ referenceId: 'bad id', tenor: 'D28', sourceDescription: 'Source' });
    c.define();
    expect(api.define).not.toHaveBeenCalled();
    c.definition.controls.referenceId.setValue('CETES_SECOND');
    c.define();
    expect(api.define).toHaveBeenCalledWith({
      referenceId: 'CETES_SECOND',
      referenceType: 'CETES',
      tenor: 'D28',
      sourceDescription: 'Source'
    });
  });
  it('denies maker and submitter self-approval even with ALL_FUNCTIONS', () => {
    expect(c.canAct({ ...fixing, status: 'PENDING_APPROVAL' } as any, 'approve')).toBe(false);
    userId = 2;
    expect(c.canAct({ ...fixing, submitterId: 2, status: 'PENDING_APPROVAL' } as any, 'approve')).toBe(false);
    userId = 3;
    expect(c.canAct({ ...fixing, status: 'PENDING_APPROVAL' } as any, 'approve')).toBe(true);
  });
  it('submits drafts and requires a reason for rejection using the fixing revision', () => {
    c.act(fixing as any, 'submit');
    expect(api.action).toHaveBeenCalledWith(fixing, 'submit', '');
    userId = 3;
    const pending = { ...fixing, status: 'PENDING_APPROVAL', revision: 1 };
    c.act(pending as any, 'reject');
    expect(api.action).toHaveBeenCalledTimes(1);
    c.decision.controls.reason.setValue('Source needs verification');
    c.act(pending as any, 'reject');
    expect(api.action).toHaveBeenLastCalledWith(pending, 'reject', 'Source needs verification');
  });
  it('retains unsaved capture on duplicate/conflict and blocks unsafe retry', () => {
    api.capture.mockReturnValue(throwError(() => new HttpErrorResponse({ status: 409 })));
    c.capture.markAsDirty();
    c.captureFixing();
    c.captureFixing();
    expect(c.conflict).toBe(true);
    expect(api.capture).toHaveBeenCalledTimes(1);
    expect(c.capture.value.annualRatePercent).toBe('1.000000000001');
    expect(c.dirty).toBe(true);
  });
  it('never displays a pending rate as the approved exact-date fixing', () => {
    c.selection.controls.businessDate.setValue('2026-11-09');
    api.effective.mockReturnValue(of({ ...fixing, status: 'PENDING_APPROVAL' }));
    c.resolve();
    expect(c.effective).toBeNull();
    expect(c.error).toBe('InterestManagement.Incompatible');
  });
  it('403 stays a permission failure with existing history intact', () => {
    api.history.mockReturnValue(throwError(() => new HttpErrorResponse({ status: 403 })));
    c.select();
    expect(c.error).toBe('SavingsEditor.Denied');
    expect(c.history).toHaveLength(1);
    expect(c.selectedLoaded).toBe(false);
  });
  it('keeps permitted benchmark definitions readable when optional business-date access is denied', () => {
    jest
      .spyOn(TestBed.inject(ProductPolicyService), 'businessDate')
      .mockReturnValue(throwError(() => new HttpErrorResponse({ status: 403 })));
    c.load();
    expect(c.loaded).toBe(true);
    expect(c.definitions).toHaveLength(1);
    expect(c.businessDateError).toBe('SavingsEditor.Denied');
    expect(c.businessDate).toBeNull();
    expect(c.captureValid).toBeFalsy();
  });
  it.each([
    '\n',
    '\r',
    '\t',
    '\x00',
    '\x85'
  ])('explains backend-rejected control characters %j in all benchmark text fields', (controlCharacter) => {
    const controls = [
      c.definition.controls.sourceDescription,
      c.capture.controls.note,
      c.capture.controls.sourceReference,
      c.decision.controls.reason
    ];
    for (const control of controls) {
      control.setValue('Before' + controlCharacter + 'after');
      control.markAsTouched();
      expect(control.hasError('controlCharacters')).toBe(true);
      expect(c.textError(control)).toBe('InterestManagement.SingleLineText');
    }
    c.definition.patchValue({ referenceId: 'CETES_NEW', tenor: 'D28' });
    expect(c.definitionValid).toBe(false);
    expect(c.captureValid).toBeFalsy();
    c.define();
    c.captureFixing();
    userId = 3;
    c.act({ ...fixing, status: 'PENDING_APPROVAL' } as any, 'reject');
    expect(c.decision.controls.reason.hasError('required')).toBe(false);
    expect(api.define).not.toHaveBeenCalled();
    expect(api.capture).not.toHaveBeenCalled();
    expect(api.action).not.toHaveBeenCalled();
  });
  it('keeps empty optional text valid and distinguishes length errors from a required reason', () => {
    c.capture.controls.note.reset();
    expect(c.capture.controls.note.valid).toBe(true);
    c.decision.controls.reason.setValue('x'.repeat(1001));
    userId = 3;
    c.act({ ...fixing, status: 'PENDING_APPROVAL' } as any, 'reject');
    expect(c.decision.controls.reason.hasError('maxlength')).toBe(true);
    expect(c.decision.controls.reason.hasError('required')).toBe(false);
    expect(c.textError(c.decision.controls.reason)).toBe('InterestManagement.TextInvalid');
    expect(api.action).not.toHaveBeenCalled();
  });
  it.each([
    'definition',
    'history',
    'audit'
  ])('requires an explicit reload when %s refresh fails after a successful capture', (resource) => {
    api[resource].mockReturnValue(throwError(() => new HttpErrorResponse({ status: 503 })));
    c.capture.markAsDirty();
    c.captureFixing();
    expect(api.capture).toHaveBeenCalledTimes(1);
    expect(c.capture.pristine).toBe(true);
    expect(c.capture.controls.annualRatePercent.value).toBeNull();
    expect(c.selectedLoaded).toBe(false);
    expect(c.notice).toBe('InterestManagement.CapturedDraft');
    expect(c.refreshFailed).toBe(true);
    expect(c.operation).toBe('InterestManagement.BenchmarkHistory');
    expect(c.error).toBe('SavingsEditor.RequestFailed');
    expect(c.conflict).toBe(false);
    expect(c.busy).toBe(false);
    c.captureFixing();
    expect(api.capture).toHaveBeenCalledTimes(1);
    expect(c.canAct(fixing as any, 'submit')).toBe(false);
    api.definition.mockReturnValue(of({ ...definition, revision: 10 }));
    api.history.mockReturnValue(of([fixing]));
    api.audit.mockReturnValue(of([]));
    c.select();
    expect(c.selectedLoaded).toBe(true);
    expect(c.selected.revision).toBe(10);
    expect(c.refreshFailed).toBe(false);
    expect(api.capture).toHaveBeenCalledTimes(1);
  });
  it.each([
    'submit',
    'approve',
    'reject'
  ] as const)('does not repeat a successful %s when authorization readback fails', (action) => {
    userId = 3;
    const target = { ...fixing, status: action === 'submit' ? 'DRAFT' : 'PENDING_APPROVAL' };
    api.audit.mockReturnValue(throwError(() => new HttpErrorResponse({ status: 403 })));
    c.decision.controls.reason.setValue('Independent decision');
    c.decision.markAsDirty();
    c.act(target as any, action);
    expect(api.action).toHaveBeenCalledTimes(1);
    expect(c.decision.pristine).toBe(true);
    expect(c.decision.controls.reason.value).toBeNull();
    expect(c.selectedLoaded).toBe(false);
    expect(c.notice).toBe('InterestManagement.AuthorizationUpdated');
    expect(c.refreshFailed).toBe(true);
    expect(c.operation).toBe('InterestManagement.BenchmarkHistory');
    expect(c.error).toBe('SavingsEditor.Denied');
    expect(c.busy).toBe(false);
    c.act(target as any, action);
    expect(api.action).toHaveBeenCalledTimes(1);
  });
  it('clears submitted input as soon as capture succeeds and keeps writes blocked until readback finishes', () => {
    const history = new Subject<any[]>();
    api.history.mockReturnValue(history);
    c.capture.markAsDirty();
    c.captureFixing();
    expect(c.capture.pristine).toBe(true);
    expect(c.busy).toBe(true);
    expect(c.selectedLoaded).toBe(false);
    c.captureFixing();
    expect(api.capture).toHaveBeenCalledTimes(1);
    history.next([fixing]);
    history.complete();
    expect(c.selectedLoaded).toBe(true);
    expect(c.busy).toBe(false);
    expect(c.refreshFailed).toBe(false);
  });
  it('retains capture input and its operation label when the write itself fails', () => {
    const reads = api.history.mock.calls.length;
    api.capture.mockReturnValue(throwError(() => new HttpErrorResponse({ status: 503 })));
    c.capture.markAsDirty();
    c.captureFixing();
    expect(c.capture.value.annualRatePercent).toBe('1.000000000001');
    expect(c.capture.dirty).toBe(true);
    expect(c.notice).toBe('');
    expect(c.refreshFailed).toBe(false);
    expect(c.selectedLoaded).toBe(true);
    expect(c.operation).toBe('InterestManagement.CaptureFixing');
    expect(c.busy).toBe(false);
    expect(api.history).toHaveBeenCalledTimes(reads);
  });
  it('retains the entered reason when the authorization write itself fails', () => {
    api.action.mockReturnValue(throwError(() => new HttpErrorResponse({ status: 503 })));
    c.decision.controls.reason.setValue('Independent reason');
    c.decision.markAsDirty();
    c.act(fixing as any, 'submit');
    expect(c.decision.value.reason).toBe('Independent reason');
    expect(c.decision.dirty).toBe(true);
    expect(c.notice).toBe('');
    expect(c.refreshFailed).toBe(false);
    expect(c.selectedLoaded).toBe(true);
    expect(c.operation).toBe('InterestManagement.FixingAuthorization');
    expect(c.busy).toBe(false);
  });
});
