/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { TestBed } from '@angular/core/testing';
import { TranslateService } from '@ngx-translate/core';
import { of } from 'rxjs';
import { describe, expect, it, jest } from '@jest/globals';

import { AlertService } from 'app/core/alert/alert.service';
import { AuthenticationService } from 'app/core/authentication/authentication.service';
import { Dates } from 'app/core/utils/dates';
import { SettingsService } from 'app/settings/settings.service';
import { SystemInfoService } from 'app/system/system-info.service';
import { SystemService } from 'app/system/system.service';
import { FooterComponent } from './footer.component';

describe('FooterComponent', () => {
  it('reads the business date with parseDate, since Fineract sends it as a [year, month, day] array', async () => {
    const parsedDate = new Date(2026, 9, 10);
    const parseDate = jest.fn(() => parsedDate);
    const setBusinessDate = jest.fn();

    await TestBed.configureTestingModule({
      imports: [FooterComponent],
      providers: [
        {
          provide: SystemService,
          useValue: {
            getBusinessDate: () =>
              of({ type: 'BUSINESS_DATE', date: [
                  2026,
                  10,
                  10
                ] })
          }
        },
        { provide: SettingsService, useValue: { setBusinessDate } },
        { provide: Dates, useValue: { parseDate, formatDate: () => '2026-10-10' } },
        { provide: AuthenticationService, useValue: {} },
        { provide: AlertService, useValue: { alertEvent: of() } },
        { provide: SystemInfoService, useValue: {} },
        { provide: TranslateService, useValue: { instant: (key: string) => key } }
      ]
    })
      .overrideComponent(FooterComponent, { set: { template: '', imports: [] } })
      .compileComponents();

    const component = TestBed.createComponent(FooterComponent).componentInstance;

    component.setBusinessDate();

    expect(parseDate).toHaveBeenCalledWith([
      2026,
      10,
      10
    ]);
    expect(component.businessDate).toBe(parsedDate);
    expect(setBusinessDate).toHaveBeenCalledWith('2026-10-10');
    expect(component.isBusinessDateDefined).toBe(true);
  });
});
