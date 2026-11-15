/**
 * Copyright since 2026 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { randomUUID } from 'crypto';
import { TestBed } from '@angular/core/testing';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { TranslateModule } from '@ngx-translate/core';
import { of, Subject, throwError } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';
import { AnpaCommandDialogComponent, CommandData } from './anpa-command-dialog.component';
import { AnpaAccountingService } from '../../services/anpa-accounting.service';
import { AnpaAccessService } from '../../services/anpa-access.service';

describe('ANPA evidence commands', () => {
  const id = '00000000-0000-4000-8000-000000000001';
  let api: { createAdjustmentProposal: jest.Mock; saveReconciliationAssessment: jest.Mock; saveAssessment: jest.Mock };
  let access: { allows: jest.Mock };
  let close: jest.Mock;
  function setup(mode: CommandData['mode'] = 'proposal') {
    TestBed.configureTestingModule({
      imports: [
        AnpaCommandDialogComponent,
        TranslateModule.forRoot()
      ],
      providers: [
        {
          provide: MAT_DIALOG_DATA,
          useValue: { mode, loanId: 2, recordId: id, asOf: '2026-11-15' }
        },
        { provide: MatDialogRef, useValue: { close } },
        { provide: AnpaAccountingService, useValue: api },
        { provide: AnpaAccessService, useValue: access }
      ]
    });
    const fixture = TestBed.createComponent(AnpaCommandDialogComponent);
    const c = fixture.componentInstance;
    c.form.patchValue({ confirmed: true, operation: 'JOURNAL_ADJUSTMENT', reason: 'Review synthetic evidence' });
    return c;
  }
  beforeEach(() => {
    Object.defineProperty(crypto, 'randomUUID', { configurable: true, value: randomUUID });
    api = {
      createAdjustmentProposal: jest.fn(() => of({ id: 'saved' })),
      saveReconciliationAssessment: jest.fn(() => of({ id: 'saved' })),
      saveAssessment: jest.fn(() => of({ id: 'saved' }))
    };
    access = { allows: jest.fn(() => true) };
    close = jest.fn();
  });
  it.each<CommandData['mode']>([
    'assessment',
    'reconciliation',
    'proposal',
    'approval'
  ])('validates the assessment reference only in reconciliation mode (%s)', (mode) => {
    const c = setup(mode);
    c.form.patchValue({
      assessmentId: '00000000-',
      reason: mode === 'proposal' ? 'Review synthetic evidence' : '',
      approvalReference: 'Synthetic approval'
    });
    expect(c.valid).toBe(mode !== 'reconciliation');
    if (mode === 'reconciliation') {
      c.submit();
      expect(api.saveReconciliationAssessment).not.toHaveBeenCalled();
    }
  });
  it('requires a reconciliation reference and operation', () => {
    const c = setup();
    c.form.controls.reconciliationId.setValue('');
    expect(c.valid).toBe(false);
    c.submit();
    expect(api.createAdjustmentProposal).not.toHaveBeenCalled();
  });
  it('records the exact proposal operation with a unique key', () => {
    const c = setup();
    c.submit();
    const payload = api.createAdjustmentProposal.mock.calls[0][1];
    expect(payload).toEqual({
      idempotencyKey: expect.any(String),
      reconciliationId: id,
      operation: 'JOURNAL_ADJUSTMENT',
      reason: 'Review synthetic evidence'
    });
    expect(close).toHaveBeenCalledWith({ id: 'saved' });
  });
  it('prevents duplicate submissions while the first result is pending', () => {
    const pending = new Subject();
    api.createAdjustmentProposal.mockReturnValue(pending);
    const c = setup();
    c.submit();
    c.submit();
    expect(api.createAdjustmentProposal).toHaveBeenCalledTimes(1);
    expect(c.busy()).toBe(true);
  });
  it.each([
    0,
    408,
    500,
    502,
    503,
    200
  ])('keeps uncertain HTTP %s submissions locked', (status) => {
    api.createAdjustmentProposal.mockReturnValue(throwError(() => new HttpErrorResponse({ status })));
    const c = setup();
    c.submit();
    c.submit();
    expect(api.createAdjustmentProposal).toHaveBeenCalledTimes(1);
    expect(c.error()).toBe('labels.anpa.errors.uncertain');
    expect(c.submitted()).toBe(true);
    expect(c.idempotencyKey).toBe(api.createAdjustmentProposal.mock.calls[0][1].idempotencyKey);
  });
  it.each([
    400,
    422
  ])('allows an explicit corrected submission after HTTP %s with a fresh key', (status) => {
    api.createAdjustmentProposal.mockReturnValueOnce(throwError(() => new HttpErrorResponse({ status })));
    const c = setup();
    c.submit();
    expect(c.submitted()).toBe(false);
    expect(c.busy()).toBe(false);
    expect(api.createAdjustmentProposal).toHaveBeenCalledTimes(1);
    c.form.controls.reason.setValue('Corrected evidence');
    c.submit();
    const [
      original,
      corrected
    ] = api.createAdjustmentProposal.mock.calls.map((call) => call[1]);
    expect(corrected).toEqual({ ...original, reason: 'Corrected evidence', idempotencyKey: expect.any(String) });
    expect(corrected.idempotencyKey).not.toBe(original.idempotencyKey);
    expect(c.error()).toBe('');
    expect(close).toHaveBeenCalledWith({ id: 'saved' });
  });
  it('includes the prefilled assessment link in a reconciliation save', () => {
    const c = setup('reconciliation');
    c.form.patchValue({ reason: '', assessmentId: id });
    c.submit();
    expect(api.saveReconciliationAssessment).toHaveBeenCalledWith(2, {
      idempotencyKey: expect.any(String),
      assessmentId: id
    });
  });
  it('shows idempotency conflicts without reporting financial success', () => {
    api.createAdjustmentProposal.mockReturnValue(throwError(() => new HttpErrorResponse({ status: 409 })));
    const c = setup();
    c.submit();
    expect(c.error()).toBe('labels.anpa.errors.conflict');
    expect(close).not.toHaveBeenCalled();
  });
  it('prevents unauthorized proposal creation', () => {
    const c = setup();
    access.allows.mockReturnValue(false);
    c.submit();
    expect(api.createAdjustmentProposal).not.toHaveBeenCalled();
  });
  it('requires confirmation', () => {
    const c = setup();
    c.form.controls.confirmed.setValue(false);
    c.submit();
    expect(api.createAdjustmentProposal).not.toHaveBeenCalled();
  });
  it('does not send a reconciliation reason without supersession', () => {
    const c = setup('reconciliation');
    expect(c.valid).toBe(false);
    c.form.controls.reason.setValue('');
    c.submit();
    expect(api.saveReconciliationAssessment).toHaveBeenCalledWith(2, { idempotencyKey: expect.any(String) });
  });
  it('pairs assessment correction reason with the superseded ID', () => {
    const c = setup('assessment');
    expect(c.valid).toBe(false);
    c.form.controls.supersedesId.setValue(id);
    c.submit();
    expect(api.saveAssessment).toHaveBeenCalledWith(2, {
      idempotencyKey: expect.any(String),
      asOf: '2026-11-15',
      supersedesAssessmentId: id,
      correctionReason: 'Review synthetic evidence'
    });
  });
});
