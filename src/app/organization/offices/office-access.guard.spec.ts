/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { TestBed } from '@angular/core/testing';
import { convertToParamMap, Router } from '@angular/router';
import { firstValueFrom, isObservable, of, throwError } from 'rxjs';
import { AuthenticationService } from 'app/core/authentication/authentication.service';
import { OrganizationService } from '../organization.service';
import { environment } from 'environments/environment';
import { officeAccessGuard } from './office-access.guard';

describe('officeAccessGuard', () => {
  const getOffices = jest.fn();
  let permissions: string[];
  const savedRbac = environment.productionModeEnableRBAC;
  beforeEach(() => {
    environment.productionModeEnableRBAC = true;
    permissions = ['READ_OFFICE'];
    getOffices.mockReset().mockReturnValue(of([{ id: 2 }]));
    TestBed.configureTestingModule({
      providers: [
        { provide: AuthenticationService, useValue: { getCredentials: () => ({ permissions }) } },
        { provide: OrganizationService, useValue: { getOffices } },
        { provide: Router, useValue: { createUrlTree: (commands: string[]) => commands.join('/') } }
      ]
    });
  });
  afterEach(() => {
    environment.productionModeEnableRBAC = savedRbac;
  });
  async function allowed(id = '2') {
    const result = TestBed.runInInjectionContext(() =>
      officeAccessGuard({ paramMap: convertToParamMap({ officeId: id }) } as any, {} as any)
    );
    return isObservable(result) ? firstValueFrom(result) : result;
  }
  it('permits an office in the server-scoped list', async () => {
    expect(await allowed()).toBe(true);
  });
  it('blocks another branch before details are resolved', async () => {
    expect(await allowed('3')).toBe('/organization/offices');
  });
  it('blocks missing read permission without sending requests', async () => {
    permissions = ['UPDATE_OFFICE'];
    expect(await allowed()).toBe('/organization/offices');
    expect(getOffices).not.toHaveBeenCalled();
  });
  it.each([
    'ALL_FUNCTIONS',
    'ALL_FUNCTIONS_READ'
  ])('preserves %s read grants', async (grant) => {
    permissions = [grant];
    expect(await allowed()).toBe(true);
  });
  it.each([
    0,
    403,
    404,
    500,
    503
  ])('redirects office-list HTTP %s failures to Organization', async (status) => {
    getOffices.mockReturnValue(throwError(() => ({ status })));
    expect(await allowed()).toBe('/organization');
    expect(getOffices).toHaveBeenCalledTimes(1);
  });
  it('checks hierarchy even with RBAC disabled', async () => {
    environment.productionModeEnableRBAC = false;
    expect(await allowed('3')).toBe('/organization/offices');
  });
});
