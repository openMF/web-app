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
import { MatSelect } from '@angular/material/select';
import { OverlayContainer } from '@angular/cdk/overlay';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { CdkStepper } from '@angular/cdk/stepper';
import { FaIconLibrary } from '@fortawesome/angular-fontawesome';
import * as solidIcons from '@fortawesome/free-solid-svg-icons';
import { TranslateModule, TranslateLoader, TranslateService } from '@ngx-translate/core';
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

describe('ClientGeneralStepComponent WEB-748 email validation', () => {
  let fixture: ComponentFixture<ClientGeneralStepComponent>;
  let component: ClientGeneralStepComponent;

  const clientTemplate: any = {
    officeOptions: [{ id: 1, name: 'Head Office' }],
    staffOptions: [],
    clientLegalFormOptions: [{ id: LegalFormId.PERSON, value: 'PERSON' }],
    clientTypeOptions: [],
    clientClassificationOptions: [],
    clientNonPersonMainBusinessLineOptions: [],
    clientNonPersonConstitutionOptions: [],
    genderOptions: [],
    savingProductOptions: []
  };

  function emailControl() {
    return component.createClientForm.get('emailAddress');
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
          useValue: { businessDate: new Date(2026, 0, 15), dateFormat: 'dd MMMM yyyy', language: { code: 'en-US' } }
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
  });

  it('stays optional when left blank', () => {
    emailControl().patchValue('');
    expect(emailControl().valid).toBe(true);
  });

  it('accepts a well-formed email', () => {
    emailControl().patchValue('client@example.com');
    expect(emailControl().valid).toBe(true);
  });

  it('rejects a malformed email', () => {
    emailControl().patchValue('not-an-email');
    expect(emailControl().hasError('pattern')).toBe(true);
  });

  it('rejects a double-dot domain', () => {
    emailControl().patchValue('client@example..com');
    expect(emailControl().hasError('pattern')).toBe(true);
  });
});

describe('ClientGeneralStepComponent WEB-1312 inclusive gender options', () => {
  let fixture: ComponentFixture<ClientGeneralStepComponent>;
  let component: ClientGeneralStepComponent;

  /** Gender code values as Fineract returns them, including inclusive options. */
  const genderOptions = [
    { id: 28, name: 'Male' },
    { id: 29, name: 'Female' },
    { id: 30, name: 'Non-binary' },
    { id: 31, name: 'Prefer not to say' }
  ];

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
    genderOptions,
    savingProductOptions: []
  };

  /** The Gender `MatSelect`, as bound in the template. */
  function genderSelect(): MatSelect {
    return fixture.debugElement
      .query(By.css('mat-select[formcontrolname="genderId"]'))
      .injector.get<MatSelect>(MatSelect);
  }

  function genderControl() {
    return component.createClientForm.get('genderId');
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
          useValue: {
            businessDate: new Date(2026, 0, 15),
            maxFutureDate: new Date(2100, 0, 1),
            dateFormat: 'dd MMMM yyyy',
            language: { code: 'en-US' }
          }
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
  });

  afterEach(() => {
    TestBed.inject(OverlayContainer).ngOnDestroy?.();
  });

  it('renders every backend-provided gender option in the selector', () => {
    genderSelect().open();
    fixture.detectChanges();

    const rendered = fixture.debugElement
      .queryAll(By.css('mat-option'))
      .map((option) => option.nativeElement.textContent.trim());

    expect(rendered).toEqual([
      'Male',
      'Female',
      'Non-binary',
      'Prefer not to say'
    ]);
  });

  it('binds each option to its Fineract code-value id', () => {
    const options = genderSelect().options.map((option) => option.value);

    expect(options).toEqual([
      28,
      29,
      30,
      31
    ]);
  });

  it('stores the code-value id of a selected additional option', () => {
    genderSelect().open();
    fixture.detectChanges();

    const nonBinary = fixture.debugElement
      .queryAll(By.css('mat-option'))
      .find((option) => option.nativeElement.textContent.trim() === 'Non-binary');
    nonBinary!.nativeElement.click();
    fixture.detectChanges();

    expect(genderControl().value).toBe(30);
  });

  it('leaves gender unanswered (optional) when no option is selected', () => {
    expect(genderControl().value).toBe('');
    expect(genderControl().valid).toBe(true);
  });
});

describe('ClientGeneralStepComponent WEB-1330 mobile country calling code', () => {
  let fixture: ComponentFixture<ClientGeneralStepComponent>;
  let component: ClientGeneralStepComponent;

  const clientTemplate: any = {
    officeOptions: [{ id: 1, name: 'Head Office' }],
    staffOptions: [],
    clientLegalFormOptions: [{ id: LegalFormId.PERSON, value: 'PERSON' }],
    clientTypeOptions: [],
    clientClassificationOptions: [],
    clientNonPersonMainBusinessLineOptions: [],
    clientNonPersonConstitutionOptions: [],
    genderOptions: [],
    savingProductOptions: []
  };

  function callingCodeSelect(): MatSelect {
    return fixture.debugElement
      .query(By.css('mat-select[formcontrolname="mobileNoCountryCode"]'))
      .injector.get<MatSelect>(MatSelect);
  }

  /** Options of an open select render in the overlay container, outside the fixture's element tree. */
  function openSelectOptions(): HTMLElement[] {
    const overlayContainer = TestBed.inject(OverlayContainer).getContainerElement();
    return Array.from(overlayContainer.querySelectorAll('mat-option'));
  }

  function callingCodeControl() {
    return component.createClientForm.get('mobileNoCountryCode');
  }

  function mobileNoControl() {
    return component.createClientForm.get('mobileNo');
  }

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        ClientGeneralStepComponent,
        TranslateModule.forRoot({
          loader: {
            provide: TranslateLoader,
            useValue: {
              getTranslation: (lang: string) =>
                of(lang === 'en' ? { countries: { IN: 'India', GB: 'United Kingdom' } } : {})
            }
          }
        })
      ],
      providers: [
        provideNativeDateAdapter(),
        provideNoopAnimations(),
        { provide: CdkStepper, useValue: { next: jest.fn(), previous: jest.fn() } },
        { provide: Dates, useValue: { formatDate: jest.fn(() => '15 January 2026') } },
        {
          provide: SettingsService,
          useValue: {
            businessDate: new Date(2026, 0, 15),
            maxFutureDate: new Date(2100, 0, 1),
            dateFormat: 'dd MMMM yyyy',
            language: { code: 'en-US' }
          }
        },
        { provide: ClientsService, useValue: { getClientWithOfficeTemplate: jest.fn(() => of(clientTemplate)) } }
      ]
    }).compileComponents();

    TestBed.inject(TranslateService).setDefaultLang('en');

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
  });

  afterEach(() => {
    TestBed.inject(OverlayContainer).ngOnDestroy?.();
  });

  it('renders the calling code selector beside the mobile number input', () => {
    expect(callingCodeSelect()).toBeTruthy();
    expect(fixture.debugElement.query(By.css('input[formcontrolname="mobileNo"]'))).toBeTruthy();
  });

  it('lists country options with their country name and dialing code', () => {
    callingCodeSelect().open();
    fixture.detectChanges();

    const india = openSelectOptions().find((option) => (option.textContent ?? '').includes('+91'));

    expect(india).toBeTruthy();
    expect(india!.textContent).toContain('India (+91)');
  });

  it('uses the unique ISO country code as the option value so shared dialing codes stay distinct', () => {
    const values = callingCodeSelect().options.map((option) => option.value);

    expect(values).toContain('IN');
    expect(values).toContain('US');
    expect(values).toContain('CA');
    expect(values.filter((value) => value === '+1')).toHaveLength(0);
  });

  it('stores the selected calling code and keeps the local number separate in the form', () => {
    callingCodeSelect().open();
    fixture.detectChanges();

    const india = openSelectOptions().find((option) => (option.textContent ?? '').includes('India'));
    india!.click();
    fixture.detectChanges();

    expect(callingCodeControl().value).toBe('IN');

    mobileNoControl().patchValue('9876543210');
    fixture.detectChanges();

    expect(mobileNoControl().value).toBe('9876543210');
  });

  it('submits the mobile number prefixed with the selected calling code and drops the helper control', () => {
    callingCodeControl().patchValue('IN');
    mobileNoControl().patchValue('9876543210');

    expect(component.clientGeneralDetails.mobileNo).toBe('+919876543210');
    expect(component.clientGeneralDetails).not.toHaveProperty('mobileNoCountryCode');
  });

  it('submits a legacy number unchanged when no calling code is selected', () => {
    mobileNoControl().patchValue('555-0100');

    expect(component.clientGeneralDetails.mobileNo).toBe('555-0100');
    expect(component.clientGeneralDetails).not.toHaveProperty('mobileNoCountryCode');
  });

  it('omits the mobile number entirely when no number is entered', () => {
    callingCodeControl().patchValue('IN');

    expect(component.clientGeneralDetails).not.toHaveProperty('mobileNo');
  });
});
