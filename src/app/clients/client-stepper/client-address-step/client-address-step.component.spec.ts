/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialog } from '@angular/material/dialog';
import { TranslateModule } from '@ngx-translate/core';
import { of } from 'rxjs';
import { describe, it, expect, jest, beforeEach } from '@jest/globals';
import { FaIconLibrary } from '@fortawesome/angular-fontawesome';
import * as solidIcons from '@fortawesome/free-solid-svg-icons';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { CdkStepper } from '@angular/cdk/stepper';

import { ClientAddressStepComponent } from './client-address-step.component';
import { FormGroupService } from 'app/shared/form-dialog/form-group.service';
import { environment } from 'environments/environment';

describe('ClientAddressStepComponent', () => {
  let component: ClientAddressStepComponent;
  let fixture: ComponentFixture<ClientAddressStepComponent>;
  let dialog: jest.Mocked<MatDialog>;
  let formGroupService: FormGroupService;

  const addressTemplate = {
    addressTypeIdOptions: [
      { id: 1, name: 'Home' }
    ],
    stateProvinceIdOptions: [
      { id: 2, name: 'Karnataka' }
    ],
    countryIdOptions: [
      { id: 3, name: 'India' }
    ]
  };

  function fieldConfiguration(latitudeEnabled = true, longitudeEnabled = true) {
    return [
      { field: 'addressType', isEnabled: true },
      { field: 'postalCode', isEnabled: true },
      { field: 'street', isEnabled: true },
      { field: 'addressLine1', isEnabled: true },
      { field: 'addressLine2', isEnabled: true },
      { field: 'addressLine3', isEnabled: true },
      { field: 'townVillage', isEnabled: true },
      { field: 'city', isEnabled: true },
      { field: 'stateProvinceId', isEnabled: true },
      { field: 'countyDistrict', isEnabled: true },
      { field: 'countryId', isEnabled: true },
      { field: 'isActive', isEnabled: true },
      { field: 'latitude', isEnabled: latitudeEnabled },
      { field: 'longitude', isEnabled: longitudeEnabled }
    ];
  }

  beforeEach(async () => {
    environment.enableClientAddressLocation = true;

    dialog = {
      open: jest.fn()
    } as unknown as jest.Mocked<MatDialog>;

    await TestBed.configureTestingModule({
      imports: [
        ClientAddressStepComponent,
        TranslateModule.forRoot()
      ],
      providers: [
        { provide: MatDialog, useValue: dialog },
        { provide: CdkStepper, useValue: { next: jest.fn(), previous: jest.fn() } },
        provideNoopAnimations()
      ]
    }).compileComponents();

    const faIconLibrary = TestBed.inject(FaIconLibrary);
    const iconList = Object.keys(solidIcons)
      .filter((key) => key !== 'fas' && key !== 'prefix' && key.startsWith('fa'))
      .map((icon) => (solidIcons as any)[icon]);
    faIconLibrary.addIcons(...iconList);

    fixture = TestBed.createComponent(ClientAddressStepComponent);
    component = fixture.componentInstance;
    component.clientAddressFieldConfig = fieldConfiguration();
    component.clientTemplate = { address: [addressTemplate] };
    formGroupService = TestBed.inject(FormGroupService);
  });

  it('should accept latitude and longitude fields in the address form', () => {
    const formFields = component.getAddressFormFields();

    expect(formFields.some((field) => field.controlName === 'latitude')).toBe(true);
    expect(formFields.some((field) => field.controlName === 'longitude')).toBe(true);
  });

  it('should use the countyDistrict backend field name in the address form', () => {
    const formFields = component.getAddressFormFields();

    expect(formFields.some((field) => field.controlName === 'countyDistrict')).toBe(true);
  });

  it('should hide latitude and longitude fields when disabled', () => {
    component.clientAddressFieldConfig = fieldConfiguration(false, false);

    const formFields = component.getAddressFormFields();

    expect(formFields.some((field) => field.controlName === 'latitude')).toBe(false);
    expect(formFields.some((field) => field.controlName === 'longitude')).toBe(false);
  });

  it('should hide latitude and longitude fields when the location feature is disabled', () => {
    environment.enableClientAddressLocation = false;

    const formFields = component.getAddressFormFields();

    expect(formFields.some((field) => field.controlName === 'latitude')).toBe(false);
    expect(formFields.some((field) => field.controlName === 'longitude')).toBe(false);
  });

  it('should apply latitude and longitude min and max validation', () => {
    const formFields = component.getAddressFormFields();
    const form = formGroupService.createFormGroup(formFields);

    form.get('latitude')?.setValue(-91);
    form.get('longitude')?.setValue(181);

    expect(form.get('latitude')?.hasError('min')).toBe(true);
    expect(form.get('longitude')?.hasError('max')).toBe(true);
  });

  it('should include latitude and longitude in the address array', () => {
    dialog.open.mockReturnValue({
      afterClosed: () =>
        of({
          data: {
            value: {
              addressTypeId: 1,
              latitude: '12.9716',
              longitude: '77.5946'
            }
          }
        })
    } as any);

    component.addAddress();

    expect(component.address.address).toEqual([
      expect.objectContaining({
        addressTypeId: 1,
        latitude: '12.9716',
        longitude: '77.5946'
      })
    ]);
  });

  it('should preserve zero coordinates and remove empty coordinate values', () => {
    dialog.open.mockReturnValue({
      afterClosed: () =>
        of({
          data: {
            value: {
              addressTypeId: 1,
              latitude: 0,
              longitude: ''
            }
          }
        })
    } as any);

    component.addAddress();

    expect(component.address.address[0].latitude).toBe(0);
    expect(component.address.address[0].longitude).toBeUndefined();
  });

  it('should remove coordinates from the address array when the location feature is disabled', () => {
    environment.enableClientAddressLocation = false;
    dialog.open.mockReturnValue({
      afterClosed: () =>
        of({
          data: {
            value: {
              addressTypeId: 1,
              latitude: 0,
              longitude: '77.5946'
            }
          }
        })
    } as any);

    component.addAddress();

    expect(component.address.address[0].latitude).toBeUndefined();
    expect(component.address.address[0].longitude).toBeUndefined();
  });

  it('should preserve zero coordinates when editing an address', () => {
    component.clientAddressData = [
      {
        addressTypeId: 1,
        latitude: '12.9716',
        longitude: '77.5946',
        isActive: true
      }
    ];
    dialog.open.mockReturnValue({
      afterClosed: () =>
        of({
          data: {
            value: {
              addressTypeId: 1,
              latitude: 0,
              longitude: 0
            }
          }
        })
    } as any);

    component.editAddress(component.clientAddressData[0], 0);

    expect(component.address.address[0]).toEqual(
      expect.objectContaining({
        latitude: 0,
        longitude: 0,
        isActive: true
      })
    );
  });

  it('should display saved coordinates in the create-client address step', () => {
    component.clientAddressData = [
      {
        addressTypeId: 1,
        latitude: '12.9716',
        longitude: '77.5946'
      }
    ];

    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('12.9716');
    expect(fixture.nativeElement.textContent).toContain('77.5946');
  });
});
