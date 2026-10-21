/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

jest.mock('jspdf', () => ({ jsPDF: class {} }));
jest.mock('jspdf-autotable', () => ({ __esModule: true, default: (): void => undefined }));

import { TestBed } from '@angular/core/testing';
import { ActivatedRoute, Router } from '@angular/router';
import { of } from 'rxjs';
import { I18nService } from 'app/core/i18n/i18n.service';
import { ClientsService } from 'app/clients/clients.service';
import { SettingsService } from 'app/settings/settings.service';
import { Dates } from 'app/core/utils/dates';
import { LoansService } from '../../loans.service';
import { CreateGlimAccountComponent } from './create-glim-account.component';
import { LoanProductBasicDetails } from '../../models/loan-product.model';

/** GET /loanproducts/basic-details: term loan products and a Working Capital product. */
const PRODUCTS: LoanProductBasicDetails[] = [
  { id: 6, productType: 'loan', name: 'Group Loan', shortName: 'GL', description: '', currency: undefined },
  {
    id: 2,
    productType: 'working-capital',
    name: 'Working Capital',
    shortName: 'WC',
    description: '',
    currency: undefined
  },
  { id: 1, productType: 'loan', name: 'Individual Loan', shortName: 'IL', description: '', currency: undefined }
];

describe('CreateGlimAccountComponent', () => {
  function create(loanProductsBasicDetails: any) {
    TestBed.configureTestingModule({
      providers: [
        {
          provide: ActivatedRoute,
          useValue: {
            data: of({
              loansAccountTemplate: { group: { id: 1, name: 'Group' } },
              loanProductsBasicDetails,
              groupsData: { activeClientMembers: [
                  { id: 4 },
                  { id: 5 }
                ] }
            })
          }
        },
        { provide: Router, useValue: {} },
        { provide: LoansService, useValue: {} },
        { provide: SettingsService, useValue: {} },
        { provide: ClientsService, useValue: {} },
        { provide: Dates, useValue: {} },
        { provide: I18nService, useValue: {} }
      ]
    });
    return TestBed.runInInjectionContext(() => new CreateGlimAccountComponent());
  }

  it('keeps only the term loan products from the route', () => {
    const component = create(PRODUCTS);
    expect(component.loanProductsBasicDetails.map((product) => product.id)).toEqual([
      6,
      1
    ]);
  });

  it('offers no products instead of failing when the route has none', () => {
    expect(create(undefined).loanProductsBasicDetails).toEqual([]);
  });
});
