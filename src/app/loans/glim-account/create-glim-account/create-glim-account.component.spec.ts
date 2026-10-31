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

describe('CreateGlimAccountComponent batch request', () => {
  /** Builds the /batches body for a GLIM application with the given member principals. */
  function batchFor(principals: number[]): any[] {
    TestBed.configureTestingModule({
      providers: [
        {
          provide: ActivatedRoute,
          useValue: {
            data: of({ loansAccountTemplate: { group: { id: 1 } }, groupsData: { activeClientMembers: [] } })
          }
        },
        { provide: Router, useValue: {} },
        { provide: LoansService, useValue: {} },
        { provide: SettingsService, useValue: { language: { code: 'en' }, dateFormat: 'dd MMMM yyyy' } },
        { provide: ClientsService, useValue: {} },
        { provide: Dates, useValue: { formatDate: (): string => '15 October 2026' } },
        { provide: I18nService, useValue: {} }
      ]
    });
    const component = TestBed.runInInjectionContext(() => new CreateGlimAccountComponent());
    const members = principals.map((principal, index) => ({ id: index + 4, principal, selected: true }));
    component.loansActiveClientMembers = { selectedClientMembers: { selectedMembers: members } } as any;
    // submit() takes the selection from the members step before building the batch
    component.selectedMembers = component.loansActiveClientMembers.selectedClientMembers;
    component.loansAccountDetailsStep = { loansAccountDetails: { productId: 6 } } as any;
    component.loansAccountTermsStep = { loansAccountTerms: {}, loanCollateral: {}, disbursementData: {} } as any;
    component.loansAccountChargesStep = { loansAccountCharges: { charges: [] } } as any;
    return component.buildRequestData().map((request) => JSON.parse(request.body));
  }

  it('creates one GLIM account: only the first loan is the parent and the last one closes the application', () => {
    const bodies = batchFor([
      500,
      600,
      700
    ]);
    expect(bodies.map((body) => body.isParentAccount)).toEqual([
      true,
      undefined,
      undefined
    ]);
    expect(bodies.map((body) => body.lastApplication)).toEqual([
      undefined,
      undefined,
      true
    ]);
    expect(new Set(bodies.map((body) => body.applicationId)).size).toBe(1);
    expect(bodies[0].applicationId).toBeGreaterThan(0);
    expect(bodies.map((body) => body.totalLoan)).toEqual([
      1800,
      1800,
      1800
    ]);
  });

  it('marks a single-member application as both parent and last', () => {
    const [body] = batchFor([500]);
    expect(body.isParentAccount).toBe(true);
    expect(body.lastApplication).toBe(true);
  });

  it('uses a new application id for every application', () => {
    const first = batchFor([500])[0].applicationId;
    TestBed.resetTestingModule();
    expect(batchFor([500])[0].applicationId).not.toBe(first);
  });
});
