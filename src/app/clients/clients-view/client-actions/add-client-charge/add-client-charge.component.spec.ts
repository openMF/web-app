/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';
import { of, Subject, throwError } from 'rxjs';
import { AddClientChargeComponent } from './add-client-charge.component';
import { ClientsService } from 'app/clients/clients.service';
import { SettingsService } from 'app/settings/settings.service';
import { Dates } from 'app/core/utils/dates';
import { provideNativeDateAdapter } from '@angular/material/core';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { ClientActionNotifierService } from '../client-action-notifier.service';

import { TranslateModule } from '@ngx-translate/core';
import { describe, it, expect, jest, beforeEach } from '@jest/globals';

describe('AddClientChargeComponent', () => {
  let component: AddClientChargeComponent;
  let fixture: ComponentFixture<AddClientChargeComponent>;

  let clientsService: jest.Mocked<ClientsService>;
  let settingsService: SettingsService;
  let dates: jest.Mocked<Dates>;
  let notifier: jest.Mocked<ClientActionNotifierService>;

  const clientId = '456';

  const setup = async () => {
    clientsService = {
      createClientCharge: jest.fn(() => of({})),
      getChargeAndTemplate: jest.fn(() =>
        of({
          chargeTimeType: { id: 1, value: 'Specified due date' },
          chargeCalculationType: { id: 1 },
          amount: 100,
          feeInterval: null
        })
      )
    } as any;

    settingsService = {
      language: { code: 'en' },
      dateFormat: 'dd MMMM yyyy',
      maxFutureDate: new Date(2030, 0, 1)
    } as any;

    dates = {
      formatDate: jest.fn(() => '20 March 2026')
    } as any;

    notifier = { notifyAndNavigate: jest.fn(), notify: jest.fn() } as any;

    await TestBed.configureTestingModule({
      imports: [
        AddClientChargeComponent,
        TranslateModule.forRoot()
      ],
      providers: [
        {
          provide: ActivatedRoute,
          useValue: {
            data: of({ clientActionData: { chargeOptions: [] } }),
            parent: { snapshot: { params: { clientId } } }
          }
        },
        { provide: ClientsService, useValue: clientsService },
        { provide: SettingsService, useValue: settingsService },
        { provide: Dates, useValue: dates },
        { provide: ClientActionNotifierService, useValue: notifier },
        provideNativeDateAdapter(),
        provideAnimationsAsync()
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(AddClientChargeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  };

  beforeEach(setup);

  it('should initialize correctly', () => {
    expect(component.clientId).toBe(clientId);
    expect(component.clientChargeForm).toBeDefined();
  });

  it('should notify and navigate after successful submission', () => {
    component.chargeDetails = { dueDateNotRequired: true, chargeTimeTypeAnnualOrMonth: false };
    component.clientChargeForm.patchValue({ chargeId: 1, amount: 100 });

    component.submit();

    expect(notifier.notifyAndNavigate).toHaveBeenCalledWith(
      'clients.actions.addCharge.success',
      TestBed.inject(ActivatedRoute)
    );
  });

  it('should not notify and navigate if API call fails', () => {
    clientsService.createClientCharge.mockReturnValueOnce(throwError(() => new Error('API error')));
    component.chargeDetails = { dueDateNotRequired: true, chargeTimeTypeAnnualOrMonth: false };
    component.clientChargeForm.patchValue({ chargeId: 1, amount: 100 });

    component.submit();

    expect(notifier.notifyAndNavigate).not.toHaveBeenCalled();
  });

  it('should apply only the latest charge template when chargeId changes rapidly', () => {
    const firstResponse$ = new Subject<any>();
    const secondResponse$ = new Subject<any>();
    clientsService.getChargeAndTemplate.mockReset();
    clientsService.getChargeAndTemplate.mockImplementation((chargeId: number) =>
      chargeId === 1 ? firstResponse$ : secondResponse$
    );

    component.clientChargeForm.controls.chargeId.setValue(1);
    component.clientChargeForm.controls.chargeId.setValue(2);

    secondResponse$.next({
      chargeTimeType: { id: 2, value: 'Annual Fee' },
      chargeCalculationType: { id: 1 },
      amount: 200,
      feeInterval: null
    });
    firstResponse$.next({
      chargeTimeType: { id: 1, value: 'Specified due date' },
      chargeCalculationType: { id: 1 },
      amount: 100,
      feeInterval: null
    });

    expect(component.clientChargeForm.value.amount).toBe(200);
  });

  it('should load template after a failed request when chargeId changes again', () => {
    clientsService.getChargeAndTemplate.mockReset();
    clientsService.getChargeAndTemplate.mockImplementation((chargeId: number) => {
      if (chargeId === 1) {
        return throwError(() => new Error('API error'));
      }
      return of({
        chargeTimeType: { id: 2, value: 'Annual Fee' },
        chargeCalculationType: { id: 1 },
        amount: 200,
        feeInterval: null
      });
    });

    component.clientChargeForm.controls.chargeId.setValue(1);
    component.clientChargeForm.controls.chargeId.setValue(2);

    expect(component.clientChargeForm.value.amount).toBe(200);
  });
});
