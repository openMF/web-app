/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { TestBed } from '@angular/core/testing';
import { ActivatedRouteSnapshot } from '@angular/router';
import { of } from 'rxjs';
import { describe, it, expect, jest, beforeEach } from '@jest/globals';

import { LoansService } from '../loans.service';
import { OrganizationService } from 'app/organization/organization.service';
import { LoanProductService } from 'app/products/loan-products/services/loan-product.service';
import { ProductsService } from 'app/products/products.service';
import { LoanActionButtonResolver } from './loan-action-button.resolver';

describe('LoanActionButtonResolver', () => {
  let resolver: LoanActionButtonResolver;
  let loansService: jest.Mocked<LoansService>;

  const routeFor = (action: string) =>
    ({
      paramMap: {
        get: jest.fn((key: string) => ({ loanId: '7', action })[key])
      }
    }) as unknown as ActivatedRouteSnapshot;

  beforeEach(() => {
    loansService = {
      getLoanAccountDetails: jest.fn()
    } as any;

    TestBed.configureTestingModule({
      providers: [
        LoanActionButtonResolver,
        { provide: LoansService, useValue: loansService },
        { provide: OrganizationService, useValue: {} },
        { provide: LoanProductService, useValue: { isLoanProduct: true } },
        { provide: ProductsService, useValue: {} }
      ]
    });

    resolver = TestBed.inject(LoanActionButtonResolver);
  });

  it('loads the loan for Add Interest Pause so the page works after a reload', () => {
    const loan = { id: 7, timeline: { expectedMaturityDate: '2027-01-15' } };
    const emitted: any[] = [];
    loansService.getLoanAccountDetails.mockReturnValue(of(loan));

    resolver.resolve(routeFor('Add Interest Pause')).subscribe((data) => emitted.push(data));

    expect(loansService.getLoanAccountDetails).toHaveBeenCalledWith('7');
    expect(emitted).toEqual([loan]);
  });
});
