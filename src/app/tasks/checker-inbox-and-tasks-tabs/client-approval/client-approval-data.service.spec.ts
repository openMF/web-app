/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { SettingsService } from 'app/settings/settings.service';
import { AuthenticationService } from 'app/core/authentication/authentication.service';
import { Router } from '@angular/router';
import { clientApprovalBatchGuard, clientApprovalReadGuard } from './client-approval.guard';
import { ClientApprovalDataService } from './client-approval-data.service';

const row = {
  id: 1,
  accountNo: '000000001',
  displayName: 'Synthetic Élise',
  officeId: 2,
  staffId: 3,
  active: false,
  status: { id: 100 }
};

describe('ClientApprovalDataService', () => {
  let service: ClientApprovalDataService;
  let http: HttpTestingController;
  let tenant: string;
  beforeEach(() => {
    tenant = 'tenant-a';
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        {
          provide: SettingsService,
          useValue: {
            get tenantIdentifier() {
              return tenant;
            }
          }
        }
      ]
    });
    service = TestBed.inject(ClientApprovalDataService);
    http = TestBed.inject(HttpTestingController);
  });
  afterEach(() => http.verify());
  it('keeps activation locks within a tenant and isolates matching client IDs in other tenants', () => {
    service.lockActivation(1);
    expect(service.isActivationLocked(1)).toBe(true);
    expect(TestBed.inject(ClientApprovalDataService).isActivationLocked(1)).toBe(true);
    tenant = 'tenant-b';
    expect(service.isActivationLocked(1)).toBe(false);
    service.lockActivation(2);
    tenant = 'tenant-a';
    expect(service.isActivationLocked(1)).toBe(true);
    expect(service.isActivationLocked(2)).toBe(false);
  });
  it('reuses only verified client list params, bounds retrieval and retains authoritative totals', () => {
    let snapshot: any;
    service.snapshot({ officeId: 2, staffId: 3, displayName: 'Élise' }).subscribe((result) => (snapshot = result));
    const request = http.expectOne((req) => req.url === '/clients');
    expect(request.request.params.keys().sort()).toEqual(
      [
        'displayName',
        'limit',
        'offset',
        'officeId',
        'orderBy',
        'sortOrder',
        'staffId',
        'status'
      ].sort()
    );
    expect(request.request.params.get('limit')).toBe('1000');
    expect(request.request.params.get('status')).toBe('pending');
    request.flush({ pageItems: [row], totalFilteredRecords: 1205 });
    expect(snapshot).toMatchObject({ complete: false, total: 1205 });
  });
  it.each([
    { pageItems: [row], totalFilteredRecords: 1, complete: true },
    { pageItems: [], totalFilteredRecords: 0, complete: true },
    { pageItems: [row], complete: false },
    { pageItems: [
        row,
        row
      ], totalFilteredRecords: 2, complete: false },
    { pageItems: [{ ...row, active: true }], totalFilteredRecords: 1, complete: false },
    { pageItems: [row], totalFilteredRecords: 0, complete: false }
  ])('recognizes completeness only with unique eligible records and a matching total: %j', (sample) => {
    let complete: boolean;
    service.snapshot({}).subscribe((result) => (complete = result.complete));
    const { complete: expected, ...response } = sample;
    http.expectOne((req) => req.url === '/clients').flush(response);
    expect(complete).toBe(expected);
  });
  it('does not mask invalid list shapes as empty success', () => {
    const failure = jest.fn();
    service.snapshot({}).subscribe({ error: failure });
    http.expectOne((req) => req.url === '/clients').flush({ totalFilteredRecords: 0 });
    expect(failure).toHaveBeenCalled();
  });
  it('uses exact account search and verifies pending status, office, staff and leading zeros with detail lookup', () => {
    let snapshot: any;
    service.account('000000001', { officeId: 2, staffId: 3 }).subscribe((result) => (snapshot = result));
    const request = http.expectOne((req) => req.url === '/search');
    expect(request.request.params.get('query')).toBe('000000001');
    expect(request.request.params.get('exactMatch')).toBe('true');
    expect(request.request.params.get('resource')).toBe('clients');
    request.flush([{ entityId: 1, entityAccountNo: '000000001', entityType: 'CLIENT' }]);
    http.expectOne('/clients/1').flush(row);
    expect(snapshot).toEqual({ rows: [row], total: 1, complete: true });
  });
  it.each([
    { ...row, active: true },
    { ...row, officeId: 99 },
    { ...row, staffId: 99 },
    { ...row, accountNo: '1' }
  ])('excludes account matches outside eligible scope %j', (result) => {
    let count: number;
    service.account('000000001', { officeId: 2, staffId: 3 }).subscribe((snapshot) => (count = snapshot.total));
    http
      .expectOne((req) => req.url === '/search')
      .flush([{ entityId: 1, entityAccountNo: '000000001', entityType: 'CLIENT' }]);
    http.expectOne('/clients/1').flush(result);
    expect(count).toBe(0);
  });
  it('refuses ambiguous exact accounts without enumerating client detail requests', () => {
    const failure = jest.fn();
    service.account('000000001', {}).subscribe({ error: failure });
    http
      .expectOne((req) => req.url === '/search')
      .flush(
        [
          1,
          2
        ].map((entityId) => ({ entityId, entityAccountNo: '000000001', entityType: 'CLIENT' }))
      );
    expect(failure).toHaveBeenCalled();
  });
});

describe('client approval route guards', () => {
  it('keeps writes alive while busy and permits leaving after settlement', () => {
    expect(clientApprovalBatchGuard({ busy: true }, null, null, null)).toBe(false);
    expect(clientApprovalBatchGuard({ busy: false }, null, null, null)).toBe(true);
  });
  it.each([
    ['READ_CLIENT'],
    ['ALL_FUNCTIONS_READ'],
    ['ALL_FUNCTIONS'],
    []
  ])('checks client read authorization: %j', (...permissions) => {
    const denied = {};
    TestBed.configureTestingModule({
      providers: [
        { provide: AuthenticationService, useValue: { getCredentials: () => ({ permissions }) } },
        { provide: Router, useValue: { createUrlTree: () => denied } }
      ]
    });
    expect(TestBed.runInInjectionContext(() => clientApprovalReadGuard(null, null))).toBe(
      permissions.length ? true : denied
    );
  });
});
