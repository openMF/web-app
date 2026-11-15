/**
 * Copyright since 2026 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { AnpaCommandDialogComponent } from './anpa-command-dialog.component';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { ActivatedRoute, convertToParamMap } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { BehaviorSubject, of, Subject, throwError } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';
import { AnpaAccountingComponent } from './anpa-accounting.component';
import { AnpaAccountingService } from '../../services/anpa-accounting.service';
import { AnpaAccessService } from '../../services/anpa-access.service';
import { template, eligibility, preview, review, npaHistory } from './anpa.fixtures';
import { AnpaMoneyPipe } from './anpa-money.pipe';
import { anpaErrorKey } from './anpa-error';

describe('NPA accounting loan details', () => {
  let fixture: ComponentFixture<AnpaAccountingComponent>;
  let component: AnpaAccountingComponent;
  let params: BehaviorSubject<ReturnType<typeof convertToParamMap>>;
  let api: Record<string, jest.Mock>;
  const access = { canRead: true, actorId: 1, allows: jest.fn(() => true) };
  beforeEach(async () => {
    params = new BehaviorSubject(convertToParamMap({ loanId: '2' }));
    access.allows.mockReturnValue(true);
    api = {};
    for (const name of [
      'getCapabilities',
      'getEligibility',
      'getHistory',
      'getReceivables',
      'getAccountingPolicy',
      'getReclassificationHistory',
      'getWriteOffReconciliation',
      'getAssessments',
      'getAccountingPolicies',
      'getReconciliationAssessments',
      'getAdjustments',
      'getPreview'
    ]) api[name] = jest.fn();
    api.getCapabilities.mockReturnValue(of(template));
    api.getEligibility.mockReturnValue(of(eligibility));
    api.getHistory.mockReturnValue(of(npaHistory));
    api.getReceivables.mockReturnValue(of(preview.receivables));
    api.getAccountingPolicy.mockReturnValue(of(review.policy));
    api.getReclassificationHistory.mockReturnValue(of(review.reclassification));
    api.getWriteOffReconciliation.mockReturnValue(of(review));
    api.getPreview.mockReturnValue(of(preview));
    for (const name of [
      'getAssessments',
      'getAccountingPolicies',
      'getReconciliationAssessments',
      'getAdjustments'
    ]) api[name].mockReturnValue(of([]));
    await TestBed.configureTestingModule({
      imports: [
        AnpaAccountingComponent,
        TranslateModule.forRoot()
      ],
      providers: [
        provideNoopAnimations(),
        {
          provide: ActivatedRoute,
          useValue: { parent: { paramMap: params }, queryParamMap: of(convertToParamMap({})) }
        },
        { provide: AnpaAccountingService, useValue: api },
        { provide: AnpaAccessService, useValue: access }
      ]
    }).compileComponents();
    const translate = TestBed.inject(TranslateService);
    translate.setTranslation('en-US', {
      labels: {
        inputs: { Unavailable: 'Unavailable' },
        anpa: {
          noTransitions: 'Historical NPA transitions are unavailable',
          currentlyNpa: 'Currently NPA',
          notNpa: 'Not currently NPA'
        }
      }
    });
    translate.use('en-US');
    fixture = TestBed.createComponent(AnpaAccountingComponent);
    component = fixture.componentInstance;
  });
  afterEach(() => fixture.destroy());
  it.each([
    true,
    false
  ])('shows current NPA %s without inventing transitions', (npa) => {
    api.getEligibility.mockReturnValue(of({ ...eligibility, loan: { ...eligibility.loan, currentNpa: npa } }));
    fixture.detectChanges();
    expect(component.eligibility()?.loan.currentNpa).toBe(npa);
    expect(component.history()?.confirmedTransitions).toEqual([]);
    expect(fixture.nativeElement.textContent).toContain('Historical NPA transitions are unavailable');
  });
  it('preserves written-off status separately from NPA', () => {
    api.getEligibility.mockReturnValue(
      of({
        ...eligibility,
        loan: { ...eligibility.loan, writtenOffOn: '2026-11-14', nativeStatus: 601, currentNpa: false }
      })
    );
    fixture.detectChanges();
    expect(component.eligibility()?.loan.nativeStatus).toBe(601);
    expect(component.eligibility()?.loan.currentNpa).toBe(false);
  });
  it('does not request operations missing from capabilities', () => {
    api.getCapabilities.mockReturnValue(
      of({
        ...template,
        capabilities: {
          ...template.capabilities,
          writeOffPreview: false,
          receivableClassification: false,
          accountingReconciliation: false,
          correctionControls: undefined
        }
      })
    );
    fixture.detectChanges();
    expect(component.canPreview).toBe(false);
    expect(component.canPropose).toBe(false);
    expect(api.getReceivables).not.toHaveBeenCalled();
    expect(api.getAccountingPolicy).not.toHaveBeenCalled();
  });
  it('keeps policy approval separate from execution capability', () => {
    fixture.detectChanges();
    expect(component.policy()?.explicitlyApproved).toBe(true);
    expect(component.template()?.capabilities.financialWriteOffCorrection).toBe(false);
    expect(fixture.nativeElement.textContent).not.toContain('Execute Adjustment');
  });
  it('does not fetch private history or reconciliation without permissions', () => {
    access.allows.mockReturnValue(false);
    fixture.detectChanges();
    expect(api.getAssessments).not.toHaveBeenCalled();
    expect(api.getWriteOffReconciliation).not.toHaveBeenCalled();
    expect(component.canSaveAssessment).toBe(false);
    expect(component.canPropose).toBe(false);
  });
  it('retains null regular/NPA, ITBMS and fee evidence', () => {
    fixture.detectChanges();
    expect(component.receivables()).toEqual(preview.receivables);
    for (const category of [
      'INTEREST',
      'FEE_COMMISSION',
      'ITBMS',
      'PENALTY'
    ]) expect(component.receivables().some((r) => r.category === category)).toBe(true);
    expect(component.receivables().some((r) => r.netGlReceivable === null)).toBe(true);
  });
  it('shows an incomplete preview without a successful accounting claim', () => {
    fixture.detectChanges();
    component.previewNow();
    expect(component.preview()?.financiallyExecutable).toBe(false);
    expect(component.preview()?.proposedReceivableExpense).toBeNull();
    expect(component.preview()?.blockers.length).toBeGreaterThan(0);
  });
  it('rejects impossible and future preview dates', () => {
    fixture.detectChanges();
    for (const day of [
      '2026-02-30',
      '2100-01-01',
      '1899-12-31'
    ]) {
      component.form.controls.asOf.setValue(day);
      expect(component.validDate).toBe(false);
    }
    component.previewNow();
    expect(api.getPreview).not.toHaveBeenCalled();
  });
  it('reports forbidden separately from backend deployment failure', () => {
    api.getReceivables.mockReturnValue(throwError(() => new HttpErrorResponse({ status: 403 })));
    fixture.detectChanges();
    expect(component.errors()).toContainEqual({ section: 'receivables', key: 'labels.anpa.errors.forbidden' });
    expect(component.template()).not.toBeNull();
  });
  it('does not indicate a backend connection when template fails', () => {
    api.getCapabilities.mockReturnValue(throwError(() => new HttpErrorResponse({ status: 502 })));
    fixture.detectChanges();
    expect(component.template()).toBeNull();
    expect(component.loading()).toBe(false);
    expect(component.errors()[0].key).toBe('labels.anpa.errors.offline');
  });
  it('cancels previous loan requests and clears selected evidence on switching', () => {
    const pending = new Subject<typeof preview>();
    api.getPreview.mockReturnValue(pending);
    fixture.detectChanges();
    component.previewNow();
    expect(pending.observed).toBe(true);
    params.next(convertToParamMap({ loanId: '1' }));
    expect(pending.observed).toBe(false);
    expect(component.preview()).toBeNull();
    expect(component.loanId).toBe(1);
    expect(api.getEligibility).toHaveBeenLastCalledWith(1);
  });
  it.each([
    [
      'assessments',
      'getAssessments'
    ],
    [
      'policies',
      'getAccountingPolicies'
    ],
    [
      'reconciliations',
      'getReconciliationAssessments'
    ],
    [
      'proposals',
      'getAdjustments'
    ]
  ] as const)('blocks %s pagination until the initial page completes', (kind, method) => {
    const pending = new Subject<[]>();
    api[method].mockReturnValue(pending);
    fixture.detectChanges();
    expect(component.pageBusy()).toContain(kind);
    component.loadMore(kind);
    expect(api[method]).toHaveBeenCalledTimes(1);
    pending.next([]);
    pending.complete();
    expect(component.pageBusy()).not.toContain(kind);
    component.loadMore(kind);
    expect(api[method]).toHaveBeenCalledTimes(2);
  });
  it('unlocks pagination after a rejected initial page', () => {
    api.getAssessments.mockReturnValue(throwError(() => new HttpErrorResponse({ status: 503 })));
    fixture.detectChanges();
    expect(component.pageBusy()).not.toContain('assessments');
    component.loadMore('assessments');
    expect(api.getAssessments).toHaveBeenCalledTimes(2);
  });
  it('cancels automatic and older manual reconciliation reads', () => {
    const automatic = new Subject<typeof review>();
    const first = new Subject<typeof review>();
    const latest = new Subject<typeof review>();
    api.getWriteOffReconciliation.mockReturnValueOnce(automatic).mockReturnValueOnce(first).mockReturnValueOnce(latest);
    fixture.detectChanges();
    component.form.controls.assessmentId.setValue('assessment-a');
    component.reconcile();
    expect(automatic.observed).toBe(false);
    component.form.controls.assessmentId.setValue('assessment-b');
    component.reconcile();
    expect(first.observed).toBe(false);
    const result = { ...review, originalAssessmentId: 'assessment-b' };
    latest.next(result);
    first.next({ ...review, originalAssessmentId: 'assessment-a' });
    automatic.next(review);
    expect(component.review()).toEqual(result);
    expect(api.getWriteOffReconciliation).toHaveBeenLastCalledWith(2, 'assessment-b');
    api.getWriteOffReconciliation.mockReturnValue(new Subject<typeof review>());
    params.next(convertToParamMap({ loanId: '1' }));
    expect(latest.observed).toBe(false);
    expect(component.review()).toBeNull();
  });
  it.each([
    'reviewed',
    ''
  ])('prefills reconciliation saves from the form with audit fallback (%s)', (formId) => {
    fixture.detectChanges();
    component.selectedAssessment.set({
      sequence: 1,
      id: 'audit',
      loanId: 2,
      productId: 2,
      officeId: 1,
      actorId: 1,
      businessDate: null,
      recordedAt: null,
      supersedesAssessmentId: null,
      correctionReason: null,
      result: preview
    });
    component.form.controls.assessmentId.setValue(formId);
    const open = jest.spyOn(TestBed.inject(MatDialog), 'open').mockReturnValue({
      afterClosed: () => of(false)
    } as MatDialogRef<AnpaCommandDialogComponent>);
    component.command('reconciliation');
    expect(open).toHaveBeenCalledWith(
      AnpaCommandDialogComponent,
      expect.objectContaining({
        data: expect.objectContaining({ assessmentId: formId || 'audit' })
      })
    );
  });
  it('uses the last sequence for cursor pagination', () => {
    fixture.detectChanges();
    component.assessments.set([
      {
        sequence: 37,
        id: 'one',
        actorId: 1,
        asOf: '2026-11-15',
        recordedAt: '2026-11-15T00:00:00Z',
        sourceFingerprint: 'hash'
      }
    ]);
    component.loadMore('assessments');
    expect(api.getAssessments).toHaveBeenLastCalledWith(2, 37, 20);
  });
  it('enforces a distinct checker and never offers approval for the active approved draft', () => {
    fixture.detectChanges();
    const draft = {
      sequence: 1,
      id: 'draft',
      kind: 'POLICY_DRAFT',
      loanId: 2,
      productId: 2,
      officeId: 1,
      actorId: 1,
      businessDate: '2026-11-15',
      recordedAt: '2026-11-15T00:00:00Z',
      parentId: null as string | null,
      sourceFingerprint: 'hash',
      request: { idempotencyKey: 'key' },
      result: review.policy.definition!
    };
    component.selectedPolicy.set(draft);
    expect(component.canApprove).toBe(false);
    component.selectedPolicy.set({ ...draft, actorId: 2 });
    expect(component.canApprove).toBe(true);
    component.selectedPolicy.set({ ...draft, actorId: 2, id: component.policy()!.policyId! });
    expect(component.canApprove).toBe(false);
  });
  it('retains reversed write-offs, recoveries and backend differences without computing new amounts', () => {
    fixture.detectChanges();
    const source = {
      ...review,
      writeOffs: review.writeOffs.map((w) => ({
        ...w,
        reversed: true,
        recoveryTransactionIds: [999],
        expenseDifference: null as number | null
      }))
    };
    api.getWriteOffReconciliation.mockReturnValue(of(source));
    component.reconcile();
    expect(component.review()!.writeOffs[0].reversed).toBe(true);
    expect(component.review()!.writeOffs[0].recoveryTransactionIds).toEqual([999]);
    expect(component.review()!.writeOffs[0].expenseDifference).toBeNull();
  });
  it('renders blocker details as accessible Material disclosure controls', () => {
    fixture.detectChanges();
    const header = fixture.nativeElement.querySelector('mifosx-anpa-blockers mat-expansion-panel-header');
    expect(header).not.toBeNull();
    expect(header.getAttribute('role')).toBe('button');
    expect(header.getAttribute('aria-expanded')).toBe('false');
  });
  it('formats unavailable monetary evidence separately from actual zero', () => {
    const pipe = TestBed.runInInjectionContext(() => new AnpaMoneyPipe());
    expect(pipe.transform(null, eligibility.loan)).toBe('Unavailable');
    expect(pipe.transform(0, eligibility.loan)).toBe('0.00 USD');
  });
  it.each([
    400,
    401,
    403,
    404,
    409,
    422,
    500,
    502,
    503
  ])('sanitizes HTTP %s errors', (status) => {
    expect(anpaErrorKey(new HttpErrorResponse({ status, error: 'java.lang.SecretException' }))).not.toContain('java');
  });
  it('requires history review after an uncertain POST result', () => {
    expect(anpaErrorKey(new HttpErrorResponse({ status: 0 }), true)).toBe('labels.anpa.errors.uncertain');
    expect(anpaErrorKey(new HttpErrorResponse({ status: 500 }), true)).toBe('labels.anpa.errors.uncertain');
  });
});
