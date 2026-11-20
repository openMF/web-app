/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DatePipe } from '@angular/common';
import { provideRouter, ActivatedRoute, convertToParamMap } from '@angular/router';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { HttpErrorResponse } from '@angular/common/http';
import { MatDialog, MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { BehaviorSubject, Subject, of, throwError } from 'rxjs';
import { readFileSync } from 'fs';
import { SettingsService } from 'app/settings/settings.service';
import { AuthenticationService } from 'app/core/authentication/authentication.service';
import { ProductPolicyService } from 'app/products/saving-products/product-editor/product-policy.service';
import { AccountManagementAccess } from './account-management-access.service';
import { AccountRelationshipsService } from './account-relationships.service';
import { GuaranteeSweepsService } from './guarantee-sweeps.service';
import { PlannedAccountsService } from './planned-accounts.service';
import { MainAccountComponent } from './main-account.component';
import { GuaranteedAccountsComponent } from './guaranteed-accounts.component';
import { GuaranteeHistoryComponent } from './guarantee-history.component';
import { PlannedMainAccountComponent } from './planned-main-account.component';
import { PlannedAccountDetailsComponent } from './planned-account-details.component';
import { PlannedAuditComponent } from './planned-audit.component';
import { SavingsPocketsComponent } from './savings-pockets.component';
import { PocketNameDialogComponent } from './pocket-name-dialog.component';
import { PlannedConfigurationDialogComponent } from './planned-configuration-dialog.component';
import { AccountManagementComponent } from './account-management.component';
import { TransactionResultComponent } from './transaction-result.component';
import { NativeAccountComponent } from './native-account.component';
import { AccountStatusComponent } from './account-status.component';
import { AccountMoneyPipe } from './account-money.pipe';
import { ResourceStateComponent } from './resource-state.component';
import {
  Arrangement,
  Decision,
  NativeSnapshot,
  Pocket,
  Receipt,
  Reconciliation,
  SweepAudit,
  PlannedCapabilities
} from './account-management.model';
import { errorKey, positiveAmount } from './account-management.state';

const uuid = 'd4a2587e-564a-4bb8-92f8-ad15ded9a400';
const mainRow = {
  clientId: 7,
  savingsAccountId: 18,
  savingsProductId: 4,
  policyVersion: 2,
  nativeStatus: 300,
  active: true
};
const snapshot: NativeSnapshot = {
  clientId: 7,
  savingsAccountId: 22,
  savingsProductId: 5,
  policyVersion: 3,
  purpose: 'POCKET',
  currency: 'USD',
  currencyDigits: 2,
  nativeStatus: 300,
  nativeSubStatus: 0,
  balance: '25.12',
  withdrawableBalance: '20.12',
  nativeInterestEarned: '1.02',
  nativeInterestPosted: '0.50',
  interestMode: 'FIXED',
  businessDate: '2026-11-12',
  blockers: ['BE10_FINANCIAL_EXECUTION_DISABLED']
};
const pocket: Pocket = {
  clientId: 7,
  savingsAccountId: 22,
  mainSavingsAccountId: 18,
  revision: 3,
  policyVersion: 3,
  mainPolicyVersion: 2,
  name: 'Holiday',
  relationshipStatus: 'LINKED',
  nativeAccount: snapshot
};
const arrangement: Arrangement = {
  id: uuid,
  clientId: 7,
  revision: 1,
  savingsAccountId: null,
  state: 'BLOCKED_PENDING_POLICY',
  financialExecutionEnabled: false,
  blockers: [],
  configuration: {
    savingsProductId: 5,
    policyVersion: 3,
    employerClientId: 9,
    arrangementReference: 'Payroll proposal',
    contributionAmount: '25.00',
    frequencyUnit: 'MONTHS',
    frequencyInterval: 1,
    shortMonthRule: 'LAST_DAY',
    startDate: '2026-11-12',
    termDays: 30,
    maturityDate: '2026-12-12',
    status: 'CONFIGURATION_ONLY'
  }
};
const caps: PlannedCapabilities = {
  arrangementConfiguration: true,
  scheduleProjection: true,
  pocketRelationships: true,
  nativeAccountCreation: false,
  payrollExecution: false,
  contributionScheduler: false,
  frozenFundRelease: false,
  maturitySettlement: false,
  pocketTransfer: false,
  accountClosure: false,
  blockers: []
};
const decision: Decision = {
  businessDate: '2026-11-12',
  loanStatus: 300,
  clientId: 7,
  loanId: 31,
  savingsAccountId: 18,
  currencyCode: 'USD',
  currencyDigits: 2,
  sourceCurrencyCode: 'USD',
  sourceCurrencyDigits: 2,
  nativeWithdrawableBalance: '100.00',
  availableGuaranteeFunds: null,
  requestedAmount: '5.00',
  loanOutstanding: '200.00',
  state: 'BLOCKED_PENDING_POLICY',
  reasons: ['BE08_APPROVED_GUARANTEE_RELATIONSHIPS_UNAVAILABLE']
};
const receipt: Receipt = {
  id: uuid,
  clientId: 7,
  loanId: 31,
  savingsAccountId: 18,
  operation: 'APPLY',
  mode: 'MANUAL',
  state: 'BLOCKED_PENDING_POLICY',
  businessDate: '2026-11-12',
  actorId: 1,
  reasonCode: 'BLOCKED_PENDING_POLICY',
  evaluation: decision,
  currencyCode: 'USD',
  requestedAmount: '5.00',
  appliedAmount: null
};
const reconciliation: Reconciliation = {
  executionId: uuid,
  status: 'NOT_ATTEMPTED',
  nativeReferencesMatch: false,
  repaymentReversed: false,
  savingsReversed: false,
  journalEntriesPresent: false,
  journalEntriesBalanced: false,
  nativeAccountingVerified: false,
  financialRetryAllowed: false
};
const sweepAudit: SweepAudit = {
  id: 1,
  executionId: uuid,
  actorId: 1,
  businessDate: '2026-11-12',
  event: 'ELIGIBILITY_EVALUATED',
  reasonCode: 'BLOCKED_PENDING_POLICY',
  evaluation: decision,
  recordedAt: '2026-11-12T08:00:00'
};

describe('Account management component state transitions', () => {
  let main: Record<string, jest.Mock>, sweeps: Record<string, jest.Mock>, planned: Record<string, jest.Mock>;
  let data: object;
  let denied: Set<string>,
    dialog: { open: jest.Mock },
    dialogRef: { close: jest.Mock; disableClose: boolean },
    policy: Record<string, jest.Mock>;
  beforeEach(() => {
    data = { clientId: 7 };
    denied = new Set();
    dialog = { open: jest.fn(() => ({ afterClosed: () => of({ confirm: true }), close: jest.fn() })) };
    dialogRef = { close: jest.fn(), disableClose: false };
    main = {
      template: jest.fn(() => of({ mainAccountRelationships: true, blockers: [] })),
      main: jest.fn(() => of({ clientId: 7, relationships: [mainRow] })),
      native: jest.fn(() =>
        of({
          id: 18,
          clientId: 7,
          accountNo: 'A18',
          savingsProductId: 5,
          currency: { code: 'USD', decimalPlaces: 2 },
          summary: { accountBalance: '100.25' }
        })
      ),
      audit: jest.fn(() => of([])),
      bind: jest.fn(() => of(mainRow))
    };
    sweeps = {
      template: jest.fn(() =>
        of({
          eligibilityDiagnostics: true,
          manualSweep: false,
          guaranteeRelease: false,
          financialEnforcement: false,
          blockers: []
        })
      ),
      sources: jest.fn(() =>
        of([{ savingsAccountId: 18, purpose: 'GUARANTEED', policyVersion: 2, nativeStatus: 300 }])
      ),
      loans: jest.fn(() => of([{ loanId: 31, nativeStatus: 300, currencyCode: 'USD' }])),
      nativeLoan: jest.fn(() => of({ id: 31, clientId: 7, currency: { code: 'USD', decimalPlaces: 2 } })),
      preview: jest.fn(() => of(decision)),
      audit: jest.fn(() => of([])),
      allocations: jest.fn(() => of([])),
      releaseStatus: jest.fn(() =>
        of({ state: 'BLOCKED_PENDING_POLICY', blockers: ['SETTLEMENT_AND_RELEASE_RULES_UNAPPROVED'], allocations: [] })
      ),
      execution: jest.fn(() => of(receipt)),
      reconciliation: jest.fn(() => of(reconciliation))
    };
    planned = {
      template: jest.fn(() => of(caps)),
      arrangements: jest.fn(() => of([arrangement])),
      pockets: jest.fn(() => of([pocket])),
      contributions: jest.fn(() =>
        of([
          {
            revision: 1,
            sequence: 1,
            dueDate: '2026-11-12',
            expectedAmount: '25.00',
            status: 'DUE_UNVERIFIED',
            executionEnabled: false
          }
        ])
      ),
      maturity: jest.fn(() => of({ state: 'BEFORE_MATURITY', executionEnabled: false, blockers: [] })),
      native: jest.fn(() => of(snapshot)),
      history: jest.fn(() => of([])),
      closure: jest.fn(() =>
        of({ state: 'CLOSURE_BLOCKED', executionEnabled: false, blockers: ['NATIVE_CLOSURE_EXECUTION_DISABLED'] })
      ),
      savePocket: jest.fn(() => of(pocket)),
      saveArrangement: jest.fn(() => of(arrangement)),
      linkNative: jest.fn(() => of({ ...arrangement, savingsAccountId: 22, revision: 2 }))
    };
    policy = {
      review: jest.fn(() =>
        of({
          proposed: {
            savingsProductId: 5,
            version: 3,
            status: 'ACTIVE',
            checkerId: 2,
            policy: { purpose: 'PLANNED_MAIN', freezing: 'NONE' },
            coreSettings: { currency_digits: 2, currency_code: 'USD' }
          }
        })
      )
    };
    TestBed.configureTestingModule({ imports: [
        TranslateModule.forRoot(),
        NoopAnimationsModule
      ], providers: [
        provideRouter([]),
        DatePipe,
        { provide: SettingsService, useValue: { dateFormat: 'yyyy-MM-dd', language: { code: 'en-US' } } },
        { provide: AuthenticationService, useValue: { getCredentials: () => ({ permissions: ['ALL_FUNCTIONS'] }) } },
        { provide: AccountManagementAccess, useValue: { has: (p: string) => !denied.has(p), anyRead: true } },
        { provide: AccountRelationshipsService, useValue: main },
        { provide: GuaranteeSweepsService, useValue: sweeps },
        { provide: PlannedAccountsService, useValue: planned },
        { provide: ProductPolicyService, useValue: policy },
        { provide: MatDialog, useValue: dialog },
        { provide: MatDialogRef, useValue: dialogRef },
        { provide: MAT_DIALOG_DATA, useFactory: () => data }
      ] });
    const translate = TestBed.inject(TranslateService);
    translate.setTranslation('en-US', JSON.parse(readFileSync('src/assets/translations/en-US.json', 'utf8')));
    translate.use('en-US');
  });
  function start<T>(type: new (...args: never[]) => T, inputs: Record<string, unknown> = {}) {
    const fixture = TestBed.createComponent(type);
    for (const [
      name,
      value
    ] of Object.entries({ clientId: 7, ...inputs })) fixture.componentRef.setInput(name, value);
    fixture.detectChanges();
    return fixture;
  }
  describe('Main accounts', () => {
    it('displays the verified relationship and native balance', () => {
      const f = start(MainAccountComponent);
      expect(f.nativeElement.textContent).toContain('18');
      expect(f.nativeElement.textContent).toContain('100.25 USD');
      expect(main.native).toHaveBeenCalledWith(7, 18);
    });
    it('renders no relationship without adopting the first savings account', () => {
      main.main.mockReturnValue(of({ clientId: 7, relationships: [] }));
      const f = start(MainAccountComponent);
      expect(f.nativeElement.textContent).toContain('No Main account relationship');
      expect(main.native).not.toHaveBeenCalled();
    });
    it('does not bind without permission, even if invoked directly', () => {
      denied.add('BIND_MAIN_SAVINGS_ACCOUNT');
      const f = start(MainAccountComponent);
      f.componentInstance.form.controls.savingsAccountId.setValue('18');
      f.componentInstance.bind();
      expect(main.bind).not.toHaveBeenCalled();
      expect(dialog.open).not.toHaveBeenCalled();
    });
    it('confirms ownership, binds and refreshes authoritative relationship and history', () => {
      const f = start(MainAccountComponent);
      f.componentInstance.form.controls.savingsAccountId.setValue('18');
      f.componentInstance.bind();
      expect(dialog.open).toHaveBeenCalled();
      expect(main.bind).toHaveBeenCalledWith(7, 18);
      expect(main.main).toHaveBeenCalledTimes(2);
      expect(main.audit).toHaveBeenCalledTimes(2);
    });
    it('prevents duplicate submissions and does not retry a conflict', () => {
      const pending = new Subject();
      main.bind.mockReturnValue(pending);
      const f = start(MainAccountComponent);
      f.componentInstance.form.controls.savingsAccountId.setValue('18');
      f.componentInstance.bind();
      f.componentInstance.bind();
      expect(main.bind).toHaveBeenCalledTimes(1);
      pending.error(new HttpErrorResponse({ status: 409 }));
      expect(f.componentInstance.message()).toBe('AccountManagement.Conflict');
      expect(f.componentInstance.busy()).toBe(false);
      expect(main.bind).toHaveBeenCalledTimes(1);
    });
    it('fails closed when the capability endpoint is missing', () => {
      main.template.mockReturnValue(throwError(() => new HttpErrorResponse({ status: 404 })));
      const f = start(MainAccountComponent);
      expect(f.componentInstance.canBind).toBe(false);
      expect(main.main).not.toHaveBeenCalled();
      expect(f.nativeElement.textContent).toContain('capability endpoint is unavailable');
    });
    it('cancels an old customer response and resets displayed native data', () => {
      const old = new Subject();
      main.main.mockReturnValueOnce(old).mockReturnValue(of({ clientId: 8, relationships: [] }));
      const f = start(MainAccountComponent);
      f.componentRef.setInput('clientId', 8);
      f.detectChanges();
      old.next({ clientId: 7, relationships: [mainRow] });
      expect(f.componentInstance.main().data.clientId).toBe(8);
      expect(f.componentInstance.native().data).toBeNull();
    });
    it('dismisses an outstanding binding confirmation on customer change', () => {
      const answer = new Subject();
      const close = jest.fn();
      dialog.open.mockReturnValue({ afterClosed: () => answer, close });
      const f = start(MainAccountComponent);
      f.componentInstance.form.controls.savingsAccountId.setValue('18');
      f.componentInstance.bind();
      f.componentRef.setInput('clientId', 8);
      f.detectChanges();
      answer.next({ confirm: true });
      expect(close).toHaveBeenCalled();
      expect(main.bind).not.toHaveBeenCalled();
    });
  });
  describe('Guarantee diagnostics', () => {
    function selected() {
      const f = start(GuaranteedAccountsComponent);
      f.componentInstance.form.patchValue({ savingsAccountId: 18, loanId: 31, amount: '5.00' });
      f.detectChanges();
      return f;
    }
    it('loads source and loan diagnostics without claiming a linked guarantee', () => {
      const f = start(GuaranteedAccountsComponent);
      expect(sweeps.sources).toHaveBeenCalledWith(7, 0);
      expect(sweeps.loans).toHaveBeenCalledWith(7, 0);
      expect(f.nativeElement.textContent).toContain('Guarantee relationship not established');
    });
    it('renders null guarantee funds as Not established and keeps Apply disabled', () => {
      const f = selected();
      f.componentInstance.evaluate();
      f.detectChanges();
      expect(f.nativeElement.querySelector('[data-testid="available-guarantee-funds"]').textContent).toContain(
        'Not established'
      );
      expect(f.nativeElement.querySelector('[data-testid="apply-guarantee"]').disabled).toBe(true);
      expect(f.nativeElement.textContent).toContain('Blocked by policy');
    });
    it('appends preview audit evidence even when the first page has no Load more button', () => {
      sweeps.audit.mockReturnValueOnce(of([sweepAudit])).mockReturnValue(of([{ ...sweepAudit, id: 2 }]));
      const f = selected();
      const history = f.debugElement.query(By.directive(GuaranteeHistoryComponent))
        .componentInstance as GuaranteeHistoryComponent;
      expect(history.audit().more).toBe(false);
      f.componentInstance.evaluate();
      expect(sweeps.audit).toHaveBeenLastCalledWith(7, 31, 1);
      expect(history.audit().data.map((row) => row.id)).toEqual([
        1,
        2
      ]);
    });
    it.each([
      '0',
      '-1',
      '1.001',
      '1e2'
    ])('does not request an invalid amount %s', (amount) => {
      const f = selected();
      f.componentInstance.form.controls.amount.setValue(amount);
      f.componentInstance.evaluate();
      expect(sweeps.preview).not.toHaveBeenCalled();
    });
    it('requires native loan precision permission before preview', () => {
      denied.add('READ_LOAN');
      const f = selected();
      f.componentInstance.evaluate();
      expect(sweeps.nativeLoan).not.toHaveBeenCalled();
      expect(sweeps.preview).not.toHaveBeenCalled();
    });
    it('requires diagnostic capability and permission', () => {
      sweeps.template.mockReturnValue(
        of({ eligibilityDiagnostics: false, manualSweep: true, financialEnforcement: true, blockers: [] })
      );
      const f = selected();
      f.componentInstance.evaluate();
      expect(sweeps.preview).not.toHaveBeenCalled();
      expect(f.nativeElement.querySelector('[data-testid="apply-guarantee"]').disabled).toBe(true);
    });
    it.each([
      409,
      422
    ])('shows rejection %s without false success or automatic retry', (status) => {
      sweeps.preview.mockReturnValue(throwError(() => new HttpErrorResponse({ status })));
      const f = selected();
      f.componentInstance.evaluate();
      expect(f.componentInstance.preview().data).toBeNull();
      expect(sweeps.preview).toHaveBeenCalledTimes(1);
    });
    it('cancels stale previews as soon as amount or selection changes', () => {
      const old = new Subject();
      sweeps.preview.mockReturnValue(old);
      const f = selected();
      f.componentInstance.evaluate();
      f.componentInstance.form.controls.amount.setValue('6.00');
      old.next(decision);
      expect(f.componentInstance.preview().data).toBeNull();
      expect(f.componentInstance.preview().loading).toBe(false);
    });
  });
  describe('Guarantee history and result', () => {
    it('uses afterId pagination and loads allocations and release blockers', () => {
      sweeps.audit
        .mockReturnValueOnce(of(Array.from({ length: 25 }, (_, i) => ({ id: i + 1, event: 'ELIGIBILITY_EVALUATED' }))))
        .mockReturnValue(of([]));
      const f = start(GuaranteeHistoryComponent, { loanId: 31 });
      expect(f.componentInstance.audit().more).toBe(true);
      f.componentInstance.loadAudit();
      expect(sweeps.audit).toHaveBeenLastCalledWith(7, 31, 25);
      expect(sweeps.allocations).toHaveBeenCalled();
      expect(f.nativeElement.textContent).toContain('Blocked by policy');
    });
    it('reads a persisted receipt then requests authorized reconciliation explicitly', () => {
      const f = start(GuaranteeHistoryComponent, { loanId: 31 });
      f.componentInstance.inspect(uuid);
      expect(sweeps.reconciliation).not.toHaveBeenCalled();
      f.componentInstance.reconcile();
      f.detectChanges();
      expect(sweeps.execution).toHaveBeenCalledWith(7, 31, uuid);
      expect(f.nativeElement.textContent).toContain('Not attempted');
      expect(f.nativeElement.textContent).toContain('No financial transaction occurred');
    });
    it('appends reconciliation audit evidence from the last displayed cursor', () => {
      sweeps.audit
        .mockReturnValueOnce(of([sweepAudit]))
        .mockReturnValue(of([{ ...sweepAudit, id: 2, reconciliation }]));
      const f = start(GuaranteeHistoryComponent, { loanId: 31 });
      f.componentInstance.inspect(uuid);
      f.componentInstance.reconcile();
      expect(sweeps.audit).toHaveBeenLastCalledWith(7, 31, 1);
      expect(f.componentInstance.audit().data.map((row) => row.id)).toEqual([
        1,
        2
      ]);
    });
    it('cancels a stale audit page before refreshing without losing or duplicating rows', () => {
      const stale = new Subject<SweepAudit[]>();
      sweeps.audit
        .mockReturnValueOnce(of([sweepAudit]))
        .mockReturnValueOnce(stale)
        .mockReturnValueOnce(of([{ ...sweepAudit, id: 2 }]));
      const f = start(GuaranteeHistoryComponent, { loanId: 31 });
      f.componentInstance.loadAudit();
      f.componentInstance.refreshAudit();
      stale.next([{ ...sweepAudit, id: 2 }]);
      expect(f.componentInstance.audit().data.map((row) => row.id)).toEqual([
        1,
        2
      ]);
    });
    it('does not refresh evidence after a cancelled reconciliation for another customer', () => {
      const stale = new Subject<Reconciliation>();
      sweeps.reconciliation.mockReturnValue(stale);
      const f = start(GuaranteeHistoryComponent, { loanId: 31 });
      f.componentInstance.inspect(uuid);
      f.componentInstance.reconcile();
      f.componentRef.setInput('clientId', 8);
      f.detectChanges();
      const calls = sweeps.audit.mock.calls.length;
      stale.next(reconciliation);
      expect(sweeps.audit).toHaveBeenCalledTimes(calls);
      expect(f.componentInstance.reconciliation().data).toBeNull();
    });
    it('does not reconcile without the dedicated permission', () => {
      denied.add('RECONCILE_GUARANTEE_SWEEP');
      const f = start(GuaranteeHistoryComponent, { loanId: 31 });
      f.componentInstance.inspect(uuid);
      f.componentInstance.reconcile();
      expect(sweeps.reconciliation).not.toHaveBeenCalled();
    });
    it('never upgrades a receipt or unknown future state into successful repayment', () => {
      const f = TestBed.createComponent(TransactionResultComponent);
      f.componentRef.setInput('receipt', { ...receipt, state: 'COMPLETED' });
      f.detectChanges();
      expect(f.componentInstance.state).toBe('UNKNOWN');
      expect(f.nativeElement.textContent).toContain('Outcome is unverified');
      expect(f.nativeElement.textContent).not.toContain('Transaction confirmed');
    });
    it('shows each reconciliation check without inferring accounting verification from positive flags', () => {
      const f = TestBed.createComponent(TransactionResultComponent);
      f.componentRef.setInput('receipt', receipt);
      f.componentRef.setInput('reconciliation', {
        ...reconciliation,
        status: 'RECONCILIATION_REQUIRED',
        nativeReferencesMatch: true,
        repaymentReversed: true,
        journalEntriesPresent: true,
        journalEntriesBalanced: true
      });
      f.detectChanges();
      for (const field of [
        'nativeReferencesMatch',
        'repaymentReversed',
        'journalEntriesPresent',
        'journalEntriesBalanced'
      ]) expect(f.nativeElement.querySelector(`[data-testid="${field}"]`).textContent.trim()).toBe('Yes');
      for (const field of [
        'savingsReversed',
        'nativeAccountingVerified',
        'financialRetryAllowed'
      ]) expect(f.nativeElement.querySelector(`[data-testid="${field}"]`).textContent.trim()).toBe('No');
      expect(f.nativeElement.textContent).toContain('alone do not verify native accounting');
      expect(f.nativeElement.textContent).toContain('No automatic financial retry');
      expect(f.nativeElement.textContent).not.toContain('Transaction confirmed');
    });
    it('renders an absent reconciliation check as unknown rather than No', () => {
      const f = TestBed.createComponent(TransactionResultComponent);
      f.componentRef.setInput('reconciliation', { ...reconciliation, nativeReferencesMatch: undefined });
      f.detectChanges();
      expect(f.nativeElement.querySelector('[data-testid="nativeReferencesMatch"]').textContent.trim()).toBe(
        'Not established'
      );
    });
  });
  describe('Planned arrangements', () => {
    it('lists only verified metadata and disables settlement', () => {
      const f = start(PlannedMainAccountComponent);
      expect(f.nativeElement.textContent).toContain('Payroll proposal');
      expect(f.nativeElement.textContent).toContain('Configuration only');
      expect(f.nativeElement.querySelector('button[disabled]')).toBeTruthy();
    });
    it('shows BE-10 unavailable independently of an empty customer list', () => {
      planned.template.mockReturnValue(throwError(() => new HttpErrorResponse({ status: 404 })));
      const f = start(PlannedMainAccountComponent);
      expect(planned.arrangements).not.toHaveBeenCalled();
      expect(f.nativeElement.textContent).toContain('capability endpoint is unavailable');
    });
    it('prevents configuration without permissions', () => {
      denied.add('CONFIGURE_PLANNED_SAVINGS');
      const f = start(PlannedMainAccountComponent);
      f.componentInstance.configure();
      expect(dialog.open).not.toHaveBeenCalled();
    });
    it('refreshes authoritative metadata after dialog save', () => {
      dialog.open.mockReturnValue({ afterClosed: () => of(true), close: jest.fn() });
      const f = start(PlannedMainAccountComponent);
      f.componentInstance.configure();
      expect(planned.arrangements).toHaveBeenCalledTimes(2);
    });
    it('shows missing maturity and no fabricated paid contribution', () => {
      const row = { ...arrangement, configuration: { ...arrangement.configuration, maturityDate: null as string } };
      const f = start(PlannedAccountDetailsComponent, { arrangement: row, capabilities: caps });
      expect(f.nativeElement.textContent).toContain('Not configured');
      expect(f.nativeElement.textContent).toContain('Due; payment unverified');
      expect(f.nativeElement.textContent).not.toContain('Paid');
      expect(planned.native).not.toHaveBeenCalled();
    });
    it('loads linked native balance and frozen restrictions without authorizing release', () => {
      planned.native.mockReturnValue(
        of({ ...snapshot, nativeSubStatus: 400, blockers: ['FREEZING_ENFORCEMENT_UNVERIFIED'] })
      );
      const f = start(PlannedAccountDetailsComponent, {
        arrangement: { ...arrangement, savingsAccountId: 22 },
        capabilities: caps
      });
      expect(f.nativeElement.textContent).toContain('Account blocked');
      expect(f.nativeElement.textContent).toContain('25.12 USD');
    });
    it('links an existing native account only after confirmation then requests refresh', () => {
      const f = start(PlannedAccountDetailsComponent, { arrangement, capabilities: caps });
      const updated = jest.fn();
      f.componentInstance.updated.subscribe(updated);
      f.componentInstance.form.controls.savingsAccountId.setValue('22');
      f.componentInstance.link();
      expect(planned.linkNative).toHaveBeenCalledWith(7, arrangement, 22);
      expect(updated).toHaveBeenCalledTimes(1);
    });
    it('does not link an account with a different product', () => {
      main.native.mockReturnValue(of({ savingsProductId: 6 }));
      const f = start(PlannedAccountDetailsComponent, { arrangement, capabilities: caps });
      f.componentInstance.form.controls.savingsAccountId.setValue('22');
      f.componentInstance.link();
      expect(planned.linkNative).not.toHaveBeenCalled();
    });
    it('paginates JDBC audit records', () => {
      planned.history
        .mockReturnValueOnce(
          of(
            Array.from({ length: 25 }, (_, i) => ({
              id: i + 1,
              action: 'CREATE',
              outcome: 'BLOCKED_PENDING_POLICY',
              actor_id: 2
            }))
          )
        )
        .mockReturnValue(of([]));
      const f = start(PlannedAuditComponent, { kind: 'arrangements', subjectId: uuid });
      f.componentInstance.load();
      expect(planned.history).toHaveBeenLastCalledWith(7, 'arrangements', uuid, 25);
    });
  });
  describe('Pocket management', () => {
    it('displays multiple pockets with separate native balances and Main references', () => {
      planned.pockets.mockReturnValue(
        of([
          pocket,
          {
            ...pocket,
            savingsAccountId: 23,
            name: 'School',
            nativeAccount: { ...snapshot, savingsAccountId: 23, balance: '88.25' }
          }
        ])
      );
      const f = start(SavingsPocketsComponent);
      expect(f.nativeElement.textContent).toContain('25.12 USD');
      expect(f.nativeElement.textContent).toContain('88.25 USD');
      expect(f.nativeElement.textContent).toContain('18');
      expect(f.nativeElement.querySelector('[data-testid="create-pocket"]').disabled).toBe(true);
      expect(f.nativeElement.querySelector('[data-testid="transfer-pocket"]').disabled).toBe(true);
      expect(f.nativeElement.querySelectorAll('[data-testid="pocket-native-account-id"]').length).toBe(2);
      expect(f.nativeElement.querySelector('a[href*="savings-accounts/22"]')).toBeNull();
      expect(f.nativeElement.querySelector('a[href*="savings-accounts/23"]')).toBeNull();
    });
    it('keeps transfer and closure disabled even if future capabilities change', () => {
      planned.template.mockReturnValue(
        of({ ...caps, pocketTransfer: true, accountClosure: true, nativeAccountCreation: true })
      );
      const f = start(SavingsPocketsComponent);
      expect(f.nativeElement.querySelector('[data-testid="transfer-pocket"]').disabled).toBe(true);
      expect(f.nativeElement.querySelector('[data-testid="close-pocket"]').disabled).toBe(true);
    });
    it('displays backend closure eligibility including zero-balance blockers', () => {
      const f = start(SavingsPocketsComponent);
      f.componentInstance.checkClosure(pocket);
      f.detectChanges();
      expect(planned.closure).toHaveBeenCalledWith(7, 22);
      expect(f.componentInstance.closure.get(22)().data.state).toBe('CLOSURE_BLOCKED');
    });
    it('does not infer pocket relationships when capability is unavailable', () => {
      planned.template.mockReturnValue(of({ ...caps, pocketRelationships: false }));
      const f = start(SavingsPocketsComponent);
      expect(planned.pockets).not.toHaveBeenCalled();
      expect(f.nativeElement.textContent).toContain('Pocket relationships are unavailable');
    });
    it('requires naming permission and refreshes after an authorized rename', () => {
      const f = start(SavingsPocketsComponent);
      denied.add('MANAGE_SAVINGS_POCKET');
      f.componentInstance.rename(pocket);
      expect(dialog.open).not.toHaveBeenCalled();
      denied.clear();
      dialog.open.mockReturnValue({ afterClosed: () => of(true), close: jest.fn() });
      f.componentInstance.rename(pocket);
      expect(planned.pockets).toHaveBeenCalledTimes(2);
    });
    it('clears pocket data and in-flight eligibility when the customer changes', () => {
      const old = new Subject();
      planned.closure.mockReturnValue(old);
      const f = start(SavingsPocketsComponent);
      f.componentInstance.checkClosure(pocket);
      planned.pockets.mockReturnValue(of([]));
      f.componentRef.setInput('clientId', 8);
      f.detectChanges();
      old.next({ state: 'CLOSURE_BLOCKED' });
      expect(f.componentInstance.pockets().data).toEqual([]);
      expect(f.componentInstance.closure.size).toBe(0);
    });
    it('shows native earned and posted interest separately', () => {
      const f = TestBed.createComponent(NativeAccountComponent);
      f.componentRef.setInput('account', snapshot);
      f.detectChanges();
      expect(f.nativeElement.textContent).toContain('1.02 USD');
      expect(f.nativeElement.textContent).toContain('0.50 USD');
    });
  });
  describe('Metadata dialogs', () => {
    it('validates pocket names and suppresses duplicate writes', () => {
      data = pocket;
      const pending = new Subject();
      planned.savePocket.mockReturnValue(pending);
      const f = TestBed.createComponent(PocketNameDialogComponent);
      f.detectChanges();
      f.componentInstance.form.controls.name.setValue(' padded ');
      f.componentInstance.save();
      expect(planned.savePocket).not.toHaveBeenCalled();
      f.componentInstance.form.controls.name.setValue('School');
      f.componentInstance.save();
      f.componentInstance.save();
      expect(planned.savePocket).toHaveBeenCalledTimes(1);
      pending.error(new HttpErrorResponse({ status: 409 }));
      expect(f.componentInstance.message()).toBe('AccountManagement.Conflict');
      expect(dialogRef.close).not.toHaveBeenCalled();
    });
    it('closes naming only after an authoritative save', () => {
      data = pocket;
      const f = TestBed.createComponent(PocketNameDialogComponent);
      f.componentInstance.save();
      expect(dialogRef.close).toHaveBeenCalledWith(true);
    });
    it('requires approved policy and explicit valid dates for configuration', () => {
      data = { clientId: 7, arrangement };
      const f = TestBed.createComponent(PlannedConfigurationDialogComponent);
      f.detectChanges();
      expect(f.componentInstance.valid).toBe(false);
      f.componentInstance.loadPolicy();
      expect(f.componentInstance.valid).toBe(true);
      f.componentInstance.form.controls.maturityDate.setValue('2026-12-13');
      expect(f.componentInstance.valid).toBe(false);
    });
    it('does not submit configuration with excessive native currency precision', () => {
      data = { clientId: 7, arrangement };
      const f = TestBed.createComponent(PlannedConfigurationDialogComponent);
      f.componentInstance.loadPolicy();
      f.componentInstance.form.controls.contributionAmount.setValue('1.001');
      f.componentInstance.save();
      expect(planned.saveArrangement).not.toHaveBeenCalled();
    });
    it('allows cancellation of existing unlinked metadata without an active policy and preserves its terms', () => {
      data = { clientId: 7, arrangement };
      policy.review.mockReturnValue(of({ proposed: { savingsProductId: 5, version: 3, status: 'SUPERSEDED' } }));
      const f = TestBed.createComponent(PlannedConfigurationDialogComponent);
      f.componentInstance.loadPolicy();
      expect(f.componentInstance.valid).toBe(false);
      f.componentInstance.form.patchValue({ status: 'CANCELLED', policyVersion: 99, contributionAmount: '' });
      expect(f.componentInstance.valid).toBe(true);
      f.componentInstance.save();
      expect(planned.saveArrangement).toHaveBeenCalledWith(7, uuid, 1, {
        ...arrangement.configuration,
        status: 'CANCELLED'
      });
    });
    it.each([
      { ...arrangement, revision: 0 },
      { ...arrangement, clientId: 8 },
      { ...arrangement, savingsAccountId: 22 },
      { ...arrangement, configuration: { ...arrangement.configuration, status: 'CANCELLED' } }
    ])('rejects cancellation for invalid revision, scope or immutable configuration', (existing) => {
      data = { clientId: 7, arrangement: existing };
      const f = TestBed.createComponent(PlannedConfigurationDialogComponent);
      f.componentInstance.form.controls.status.setValue('CANCELLED');
      f.componentInstance.save();
      expect(planned.saveArrangement).not.toHaveBeenCalled();
    });
    it('requires configuration permission and preserves a backend cancellation rejection', () => {
      data = { clientId: 7, arrangement };
      denied.add('CONFIGURE_PLANNED_SAVINGS');
      const f = TestBed.createComponent(PlannedConfigurationDialogComponent);
      f.componentInstance.form.controls.status.setValue('CANCELLED');
      f.componentInstance.save();
      expect(planned.saveArrangement).not.toHaveBeenCalled();
      denied.clear();
      planned.saveArrangement.mockReturnValue(throwError(() => new HttpErrorResponse({ status: 422 })));
      f.componentInstance.save();
      expect(f.componentInstance.message()).toBe('AccountManagement.PolicyRejected');
      expect(dialogRef.close).not.toHaveBeenCalled();
    });
    it('submits configuration metadata once and keeps failures out of success', () => {
      data = { clientId: 7, arrangement };
      const pending = new Subject();
      planned.saveArrangement.mockReturnValue(pending);
      const f = TestBed.createComponent(PlannedConfigurationDialogComponent);
      f.componentInstance.loadPolicy();
      f.componentInstance.save();
      f.componentInstance.save();
      expect(planned.saveArrangement).toHaveBeenCalledTimes(1);
      pending.error(new HttpErrorResponse({ status: 422 }));
      expect(dialogRef.close).not.toHaveBeenCalled();
      expect(f.componentInstance.message()).toBe('AccountManagement.PolicyRejected');
    });
  });
  describe('Shared presentation and routing', () => {
    it('clears the entire customer component identity on a route change', () => {
      const params = new BehaviorSubject(convertToParamMap({ clientId: '7' }));
      TestBed.resetTestingModule();
      TestBed.configureTestingModule({
        imports: [TranslateModule.forRoot()],
        providers: [
          { provide: ActivatedRoute, useValue: { parent: { paramMap: params } } },
          { provide: AccountManagementAccess, useValue: { anyRead: true } },
          { provide: SettingsService, useValue: { server: 'server', tenantIdentifier: 'default' } },
          {
            provide: AuthenticationService,
            useValue: { getCredentials: () => ({ userId: 1 }), isAuthenticated$: of(true) }
          }
        ]
      });
      const f = TestBed.createComponent(AccountManagementComponent);
      const values: number[][] = [];
      f.componentInstance.customer$.subscribe((v) => values.push(v));
      params.next(convertToParamMap({ clientId: '8' }));
      params.next(convertToParamMap({ clientId: 'bad' }));
      expect(values).toEqual([
        [7],
        [8],
        []
      ]);
    });
    it('drops all customer state after a cross-tab tenant context change', () => {
      TestBed.resetTestingModule();
      const params = new BehaviorSubject(convertToParamMap({ clientId: '7' }));
      const settings = { server: 'server', tenantIdentifier: 'default' };
      TestBed.configureTestingModule({
        imports: [TranslateModule.forRoot()],
        providers: [
          { provide: ActivatedRoute, useValue: { parent: { paramMap: params } } },
          { provide: AccountManagementAccess, useValue: { anyRead: true } },
          { provide: SettingsService, useValue: settings },
          {
            provide: AuthenticationService,
            useValue: { getCredentials: () => ({ userId: 1 }), isAuthenticated$: of(true) }
          }
        ]
      });
      const f = TestBed.createComponent(AccountManagementComponent);
      const values: number[][] = [];
      const sub = f.componentInstance.customer$.subscribe((value) => values.push(value));
      settings.tenantIdentifier = 'another-tenant';
      window.dispatchEvent(new StorageEvent('storage', { key: 'mifosXTenantIdentifier' }));
      expect(values).toEqual([
        [7],
        []
      ]);
      expect(f.componentInstance.contextInvalid()).toBe(true);
      sub.unsubscribe();
    });
    it('formats exact large balances and preserves null separately from zero', () => {
      const pipe = TestBed.runInInjectionContext(() => new AccountMoneyPipe());
      expect(pipe.transform('9999999999999.12', 'USD', 2)).toBe('9,999,999,999,999.12 USD');
      expect(pipe.transform(null, 'USD', 2)).toBe('Not established');
      expect(pipe.transform('0', 'USD', 2)).toBe('0.00 USD');
    });
    it('translates a verified native product restriction embedded in guarantee diagnostics', () => {
      const f = TestBed.createComponent(AccountStatusComponent);
      f.componentRef.setInput('code', 'withdrawals.disabled');
      f.detectChanges();
      expect(f.nativeElement.textContent).toContain(
        TestBed.inject(TranslateService).instant('FinancialControls.Errors.withdrawals.disabled')
      );
      expect(f.nativeElement.textContent.trim()).not.toBe('Unavailable');
    });
    it.each([
      'SQL_ERROR private customer data',
      '__proto__',
      'constructor'
    ])('renders unknown backend code %s safely', (code) => {
      const f = TestBed.createComponent(AccountStatusComponent);
      f.componentRef.setInput('code', code);
      f.detectChanges();
      expect(f.nativeElement.textContent.trim()).toBe('Unavailable');
    });
    it('distinguishes loading, error and reload UI', () => {
      const f = TestBed.createComponent(ResourceStateComponent);
      f.componentRef.setInput('state', { loading: true, data: null, error: null });
      f.detectChanges();
      expect(f.nativeElement.querySelector('mat-progress-bar')).toBeTruthy();
      f.componentRef.setInput('state', { loading: false, data: null, error: 'AccountManagement.Conflict' });
      f.detectChanges();
      const retry = jest.fn();
      expect(f.nativeElement.querySelector('button')).toBeNull();
      f.componentInstance.retry.subscribe(retry);
      f.componentRef.setInput('state', { loading: false, data: null, error: 'AccountManagement.Conflict' });
      f.detectChanges();
      f.nativeElement.querySelector('button').click();
      expect(retry).toHaveBeenCalled();
      expect(f.nativeElement.querySelector('[role="alert"]')).toBeTruthy();
    });
    it.each([
      400,
      401,
      403,
      404,
      409,
      422,
      429,
      500,
      0
    ])('maps status %s safely and distinguishes endpoint 404', (status) => {
      const error = new HttpErrorResponse({ status, error: { message: 'SQL credentials' } });
      expect(errorKey(error)).not.toContain('SQL');
      if (status === 404) expect(errorKey(error, true)).not.toBe(errorKey(error));
    });
    it('validates native precision including trailing zeros', () => {
      expect(positiveAmount('1.000', 2)).toBe(true);
      expect(positiveAmount('1.001', 2)).toBe(false);
      expect(positiveAmount('0.00', 2)).toBe(false);
    });
  });
});

describe('AccountManagementAccess backend authorities', () => {
  let permissions: string[] = [];
  beforeEach(() =>
    TestBed.configureTestingModule({
      providers: [{ provide: AuthenticationService, useValue: { getCredentials: () => ({ permissions }) } }]
    })
  );
  it('requires exact plugin permissions even when a menu grants all reads', () => {
    permissions = ['ALL_FUNCTIONS_READ'];
    const access = TestBed.inject(AccountManagementAccess);
    expect(access.has('READ_GUARANTEE_SWEEP')).toBe(false);
    expect(access.anyRead).toBe(false);
  });
  it('accepts exact resource authority and ALL_FUNCTIONS', () => {
    permissions = ['READ_GUARANTEE_SWEEP'];
    const access = TestBed.inject(AccountManagementAccess);
    expect(access.anyRead).toBe(true);
    expect(access.has('APPLY_GUARANTEE_SWEEP')).toBe(false);
    permissions = ['ALL_FUNCTIONS'];
    expect(access.has('MANAGE_SAVINGS_POCKET')).toBe(true);
  });
});
