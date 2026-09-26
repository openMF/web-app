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
  });

  it('enables the service payment menu state when production mode is enabled', () => {
    expect(createComponent(true).productionMode).toBe(true);
  });
});
