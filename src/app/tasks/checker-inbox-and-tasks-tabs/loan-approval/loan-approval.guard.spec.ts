/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { AuthenticationService } from 'app/core/authentication/authentication.service';
import { loanApprovalReadGuard, loanApprovalActionGuard, loanApprovalBatchGuard } from './loan-approval.guard';

describe('Loan approval authorization and batch lifecycle', () => {
  let permissions: string[];
  const denied = { redirect: '/' };
  beforeEach(() => {
    permissions = [];
    TestBed.configureTestingModule({
      providers: [
        { provide: AuthenticationService, useValue: { getCredentials: () => ({ permissions }) } },
        { provide: Router, useValue: { createUrlTree: () => denied } }
      ]
    });
  });
  it.each([
    'READ_LOAN',
    'ALL_FUNCTIONS_READ',
    'ALL_FUNCTIONS'
  ])('permits reading for %s', (grant) => {
    permissions = [grant];
    expect(TestBed.runInInjectionContext(() => loanApprovalReadGuard({} as any, {} as any))).toBe(true);
  });
  it('does not permit reading without read permissions', () =>
    expect(TestBed.runInInjectionContext(() => loanApprovalReadGuard({} as any, {} as any))).toBe(denied));
  it.each([
    'APPROVE_LOAN_CHECKER',
    'READ_LOAN',
    'ALL_FUNCTIONS_READ'
  ])('blocks new approval commands for %s, including direct routes', (grant) => {
    permissions = [grant];
    expect(
      TestBed.runInInjectionContext(() => loanApprovalActionGuard({ params: { action: 'Approve' } } as any, {} as any))
    ).toBe(denied);
  });
  it.each([
    'APPROVE_LOAN',
    'ALL_FUNCTIONS'
  ])('allows a normal approval form for %s', (grant) => {
    permissions = [grant];
    expect(
      TestBed.runInInjectionContext(() => loanApprovalActionGuard({ params: { action: 'Approve' } } as any, {} as any))
    ).toBe(true);
  });
  it('preserves unrelated loan action routing', () =>
    expect(
      TestBed.runInInjectionContext(() => loanApprovalActionGuard({ params: { action: 'Disburse' } } as any, {} as any))
    ).toBe(true));
  it('prevents switching queues while a confirmed financial write is running', () => {
    expect((loanApprovalBatchGuard as any)({ busy: true })).toBe(false);
    expect((loanApprovalBatchGuard as any)({ busy: false })).toBe(true);
  });
});
