/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { provideNativeDateAdapter } from '@angular/material/core';
import { MatDatepickerInput } from '@angular/material/datepicker';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { CdkStepper } from '@angular/cdk/stepper';
import { FaIconLibrary } from '@fortawesome/angular-fontawesome';
import * as solidIcons from '@fortawesome/free-solid-svg-icons';
import { TranslateModule } from '@ngx-translate/core';
import { of } from 'rxjs';
import { describe, it, expect, jest, beforeEach } from '@jest/globals';

import { ClientGeneralStepComponent } from './client-general-step.component';
import { ClientsService } from 'app/clients/clients.service';
import { LegalFormId } from 'app/clients/models/legal-form.enum';
import { Dates } from 'app/core/utils/dates';
import { SettingsService } from 'app/settings/settings.service';

describe('ClientGeneralStepComponent WEB-1103 incorporation validity date', () => {
  let fixture: ComponentFixture<ClientGeneralStepComponent>;
  let component: ClientGeneralStepComponent;

  const businessDate = new Date(2026, 0, 15);
  const maxFutureDate = new Date(2100, 0, 1);

  const clientTemplate: any = {
    officeOptions: [{ id: 1, name: 'Head Office' }],
    staffOptions: [],
    clientLegalFormOptions: [
      { id: LegalFormId.PERSON, value: 'PERSON' },
      { id: LegalFormId.ENTITY, value: 'ENTITY' }
    ],
    clientTypeOptions: [],
    clientClassificationOptions: [],
    clientNonPersonMainBusinessLineOptions: [],
    clientNonPersonConstitutionOptions: [],
    genderOptions: [],
    savingProductOptions: []
  };

  /** The `Incorporation Validity Till Date` datepicker, as bound in the template. */
  function incorpValidityDatePicker(): MatDatepickerInput<Date> {
    return fixture.debugElement
      .query(By.css('input[formControlName="incorpValidityTillDate"]'))
      .injector.get<MatDatepickerInput<Date>>(MatDatepickerInput);
  }

  function incorpValidityControl() {
    return component.createClientForm.get('clientNonPersonDetails.incorpValidityTillDate');
  }

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        ClientGeneralStepComponent,
        TranslateModule.forRoot()
      ],
      providers: [
        provideNativeDateAdapter(),
        provideNoopAnimations(),
        { provide: CdkStepper, useValue: { next: jest.fn(), previous: jest.fn() } },
        { provide: Dates, useValue: { formatDate: jest.fn(() => '15 January 2026') } },
        {
          provide: SettingsService,
          useValue: { businessDate, maxFutureDate, dateFormat: 'dd MMMM yyyy', language: { code: 'en-US' } }
        },
        { provide: ClientsService, useValue: { getClientWithOfficeTemplate: jest.fn(() => of(clientTemplate)) } }
      ]
    }).compileComponents();

    const faIconLibrary = TestBed.inject(FaIconLibrary);
    faIconLibrary.addIcons(
      ...Object.keys(solidIcons)
        .filter((key) => key !== 'fas' && key !== 'prefix' && key.startsWith('fa'))
        .map((icon) => (solidIcons as any)[icon])
    );

    fixture = TestBed.createComponent(ClientGeneralStepComponent);
    component = fixture.componentInstance;
    component.clientTemplate = clientTemplate;
    fixture.detectChanges();

    component.createClientForm.get('legalFormId').patchValue(LegalFormId.ENTITY);
    fixture.detectChanges();
  });

  it('allows future incorporation validity dates', () => {
    expect(incorpValidityDatePicker().max).toEqual(maxFutureDate);
  });

  it('falls back to the generic minimum when no incorporation date is set', () => {
    expect(incorpValidityDatePicker().min).toEqual(component.minDate);
  });

  it('rejects validity dates before the incorporation date', () => {
    const incorporationDate = new Date(2026, 5, 10);
    component.createClientForm.get('dateOfBirth').patchValue(incorporationDate);
    fixture.detectChanges();

    expect(incorpValidityDatePicker().min).toEqual(incorporationDate);

    incorpValidityControl().patchValue(new Date(2026, 4, 10));

    expect(incorpValidityControl().hasError('matDatepickerMin')).toBe(true);
  });
});
