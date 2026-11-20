/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { TestBed } from '@angular/core/testing';
import { UntypedFormBuilder } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { CentersService } from 'app/centers/centers.service';
import { Dates } from 'app/core/utils/dates';
import { SettingsService } from 'app/settings/settings.service';
import { ActivateCenterComponent } from './activate-center.component';

describe('ActivateCenterComponent', () => {
  /** A business date behind the computer clock, as on a tenant whose close of business has not run yet. */
  const businessDate = new Date(2026, 9, 20);

  it('starts on the business date, the latest activation date the form accepts', () => {
    TestBed.configureTestingModule({
      providers: [
        UntypedFormBuilder,
        { provide: CentersService, useValue: {} },
        { provide: SettingsService, useValue: { businessDate } },
        { provide: Dates, useValue: {} },
        { provide: ActivatedRoute, useValue: { parent: { snapshot: { params: { centerId: '3' } } } } },
        { provide: Router, useValue: {} }
      ]
    });
    const component = TestBed.runInInjectionContext(() => new ActivateCenterComponent());

    component.ngOnInit();

    expect(component.maxDate).toBe(businessDate);
    expect(component.activateCenterForm.value.activationDate).toBe(businessDate);
    expect(component.activateCenterForm.valid).toBe(true);
  });
});
