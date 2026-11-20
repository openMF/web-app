/**
 * Copyright since 2026 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { TestBed } from '@angular/core/testing';
import { AuthenticationService } from 'app/core/authentication/authentication.service';
import { AnpaAccessService } from './anpa-access.service';

describe('ANPA permission boundaries', () => {
  const auth = { getCredentials: jest.fn() };
  beforeEach(() => TestBed.configureTestingModule({ providers: [{ provide: AuthenticationService, useValue: auth }] }));
  it('requires plugin and native read permissions', () => {
    auth.getCredentials.mockReturnValue({ permissions: ['READ_ANPA_ACCOUNTING'] });
    expect(TestBed.inject(AnpaAccessService).canRead).toBe(false);
  });
  it('allows read-only superusers but denies mutation privileges', () => {
    auth.getCredentials.mockReturnValue({ permissions: ['ALL_FUNCTIONS_READ'] });
    const service = TestBed.inject(AnpaAccessService);
    expect(service.canRead).toBe(true);
    expect(service.allows('CREATE_ANPA_ASSESSMENT')).toBe(false);
  });
  it('fails closed for missing credentials', () => {
    auth.getCredentials.mockReturnValue(null);
    expect(TestBed.inject(AnpaAccessService).canRead).toBe(false);
  });
});
