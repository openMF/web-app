/**
 * Copyright since 2026 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { TestBed } from '@angular/core/testing';
import { ActivatedRouteSnapshot, Router, RouterStateSnapshot, convertToParamMap } from '@angular/router';
import { AnpaAccessService } from '../../services/anpa-access.service';
import { anpaAccountingGuard } from './anpa-accounting.guard';

describe('ANPA route access', () => {
  const access = { canRead: true };
  const redirect = { redirect: true };
  const router = { createUrlTree: jest.fn(() => redirect) };
  beforeEach(() => {
    access.canRead = true;
    TestBed.configureTestingModule({
      providers: [
        { provide: AnpaAccessService, useValue: access },
        { provide: Router, useValue: router }
      ]
    });
  });
  function enter(type = 'loan') {
    const route = {
      queryParamMap: convertToParamMap({ productType: type }),
      queryParams: { productType: type },
      parent: { paramMap: convertToParamMap({ loanId: '2' }) }
    } as unknown as ActivatedRouteSnapshot;
    return TestBed.runInInjectionContext(() => anpaAccountingGuard(route, {} as RouterStateSnapshot));
  }
  it('allows an authorized standard loan', () => expect(enter()).toBe(true));
  it('blocks working capital even with accounting permissions', () => expect(enter('working-capital')).toBe(redirect));
  it('blocks direct navigation without required read permissions', () => {
    access.canRead = false;
    expect(enter()).toBe(redirect);
  });
});
