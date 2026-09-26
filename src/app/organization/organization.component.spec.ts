/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { TestBed } from '@angular/core/testing';
import { ActivatedRoute, Router } from '@angular/router';
import { afterEach, describe, expect, it } from '@jest/globals';

import { ConfigurationWizardService } from '../configuration-wizard/configuration-wizard.service';
import { PopoverService } from '../configuration-wizard/popover/popover.service';
import { environment } from 'environments/environment';
import { OrganizationComponent } from './organization.component';

describe('OrganizationComponent', () => {
  const originalProductionMode = environment.productionMode;

  afterEach(() => {
    environment.productionMode = originalProductionMode;
  });

  function createComponent(productionMode: boolean): OrganizationComponent {
    TestBed.resetTestingModule();
    environment.productionMode = productionMode;
    TestBed.configureTestingModule({
      providers: [
        { provide: ActivatedRoute, useValue: {} },
        { provide: Router, useValue: {} },
        { provide: ConfigurationWizardService, useValue: {} },
        { provide: PopoverService, useValue: {} }
      ]
    });
    return TestBed.runInInjectionContext(() => new OrganizationComponent());
  }

  it('hides the service payment menu state when production mode is disabled', () => {
    expect(createComponent(false).productionMode).toBe(false);
    expect(createComponent(false).baseTellerPermissions).not.toContain('READ_BASE_TELLER_SERVICE_PAYMENT');
  });

  it('enables the service payment menu state when production mode is enabled', () => {
    expect(createComponent(true).productionMode).toBe(true);
    expect(createComponent(true).baseTellerPermissions).toContain('READ_BASE_TELLER_SERVICE_PAYMENT');
  });

  it('uses all WEB-1232 permissions for Base Teller navigation', () => {
    expect(createComponent(false).baseTellerPermissions).toEqual([
      'READ_TELLER',
      'DEPOSIT_SAVINGSACCOUNT',
      'READ_BASE_TELLER_RETURNED_CHECK_PAYMENT',
      'READ_CASHIER_CLOSING',
      'READ_GLOBAL_SETTLEMENT',
      'CREATE_CASH_DEPOSIT',
      'READ_CASH_OPERATION_HISTORY',
      'READ_CASH_HOLDINGS'
    ]);
  });
});
