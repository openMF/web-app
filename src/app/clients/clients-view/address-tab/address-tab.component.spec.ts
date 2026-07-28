/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { TranslateModule } from '@ngx-translate/core';
import { BehaviorSubject, of } from 'rxjs';
import { describe, it, expect, jest, beforeEach } from '@jest/globals';
import * as L from 'leaflet';
import { FaIconLibrary } from '@fortawesome/angular-fontawesome';
import * as solidIcons from '@fortawesome/free-solid-svg-icons';
import { provideNoopAnimations } from '@angular/platform-browser/animations';

import { AddressTabComponent } from './address-tab.component';
import { ClientsService } from '../../clients.service';
import { PostalCodeLookupService } from 'app/shared/services/postal-code-lookup.service';
import { FormGroupService } from 'app/shared/form-dialog/form-group.service';
import { environment } from 'environments/environment';

const mockMapRemove = jest.fn();
const mockMapSetView = jest.fn().mockReturnThis();
const mockMapInvalidateSize = jest.fn();
const mockMarkerSetLatLng = jest.fn();
const mockTileLayerAddTo = jest.fn().mockReturnThis();
const mockTileLayerOn = jest.fn().mockReturnValue({ addTo: mockTileLayerAddTo, on: jest.fn() });
const mockMarkerAddTo = jest.fn().mockReturnThis();

jest.mock('leaflet', () => ({
  icon: jest.fn(() => ({})),
  map: jest.fn(() => ({
    setView: mockMapSetView,
    invalidateSize: mockMapInvalidateSize,
    remove: mockMapRemove
  })),
  tileLayer: jest.fn(() => ({
    addTo: mockTileLayerAddTo,
    on: mockTileLayerOn
  })),
  marker: jest.fn(() => ({
    addTo: mockMarkerAddTo,
    setLatLng: mockMarkerSetLatLng
  }))
}));

describe('AddressTabComponent', () => {
  let component: AddressTabComponent;
  let fixture: ComponentFixture<AddressTabComponent>;
  let routeData: BehaviorSubject<any>;
  let clientsService: jest.Mocked<ClientsService>;
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
    jest.clearAllMocks();
    environment.enableClientAddressLocation = true;

    routeData = new BehaviorSubject({
      clientAddressData: [
        {
          addressId: 11,
          addressTypeId: 1,
          addressType: 'Home',
          street: 'MG Road',
          latitude: '12.9716',
          longitude: '77.5946',
          isActive: true
        }
      ],
      clientAddressFieldConfig: fieldConfiguration(),
      clientAddressTemplateData: addressTemplate
    });

    clientsService = {
      createClientAddress: jest.fn(() => of({ resourceId: 22 })),
      editClientAddress: jest.fn(() => of({ resourceId: 11 }))
    } as unknown as jest.Mocked<ClientsService>;

    dialog = {
      open: jest.fn()
    } as unknown as jest.Mocked<MatDialog>;

    await TestBed.configureTestingModule({
      imports: [
        AddressTabComponent,
        TranslateModule.forRoot()
      ],
      providers: [
        {
          provide: ActivatedRoute,
          useValue: {
            data: routeData.asObservable(),
            parent: {
              snapshot: {
                paramMap: {
                  get: jest.fn(() => '7')
                }
              }
            }
          }
        },
        { provide: ClientsService, useValue: clientsService },
        { provide: MatDialog, useValue: dialog },
        { provide: PostalCodeLookupService, useValue: { enabled: false } },
        provideNoopAnimations()
      ]
    }).compileComponents();

    const faIconLibrary = TestBed.inject(FaIconLibrary);
    const iconList = Object.keys(solidIcons)
      .filter((key) => key !== 'fas' && key !== 'prefix' && key.startsWith('fa'))
      .map((icon) => (solidIcons as any)[icon]);
    faIconLibrary.addIcons(...iconList);

    fixture = TestBed.createComponent(AddressTabComponent);
    component = fixture.componentInstance;
    formGroupService = TestBed.inject(FormGroupService);
  });

  it('should show latitude and longitude fields when enabled', () => {
    const formFields = component.getAddressFormFields('add');

    expect(formFields.some((field) => field.controlName === 'latitude')).toBe(true);
    expect(formFields.some((field) => field.controlName === 'longitude')).toBe(true);
  });

  it('should use the countyDistrict backend field name in the address form', () => {
    const formFields = component.getAddressFormFields('add');

    expect(formFields.some((field) => field.controlName === 'countyDistrict')).toBe(true);
  });

  it('should hide latitude and longitude fields when disabled', () => {
    component.clientAddressFieldConfig = fieldConfiguration(false, false);

    const formFields = component.getAddressFormFields('add');

    expect(formFields.some((field) => field.controlName === 'latitude')).toBe(false);
    expect(formFields.some((field) => field.controlName === 'longitude')).toBe(false);
  });

  it('should hide latitude and longitude fields when the location feature is disabled', () => {
    environment.enableClientAddressLocation = false;

    const formFields = component.getAddressFormFields('add');

    expect(formFields.some((field) => field.controlName === 'latitude')).toBe(false);
    expect(formFields.some((field) => field.controlName === 'longitude')).toBe(false);
  });

  it('should include latitude and longitude in the add payload', () => {
    dialog.open.mockReturnValue({
      afterClosed: () =>
        of({
          data: {
            value: {
              addressType: 1,
              latitude: '12.9716',
              longitude: '77.5946'
            }
          }
        })
    } as any);

    component.addAddress();

    expect(clientsService.createClientAddress).toHaveBeenCalledWith(
      '7',
      1,
      expect.objectContaining({
        latitude: '12.9716',
        longitude: '77.5946'
      })
    );
    expect(component.clientAddressData[component.clientAddressData.length - 1]).toEqual(
      expect.objectContaining({
        latitude: '12.9716',
        longitude: '77.5946'
      })
    );
  });

  it('should include latitude and longitude in the edit payload', () => {
    dialog.open.mockReturnValue({
      afterClosed: () =>
        of({
          data: {
            value: {
              latitude: '13',
              longitude: '78'
            }
          }
        })
    } as any);

    component.editAddress(component.clientAddressData[0], 0);

    expect(clientsService.editClientAddress).toHaveBeenCalledWith(
      '7',
      1,
      expect.objectContaining({
        addressId: 11,
        latitude: '13',
        longitude: '78'
      })
    );
    expect(component.clientAddressData[0]).toEqual(
      expect.objectContaining({
        latitude: '13',
        longitude: '78'
      })
    );
  });

  it('should remove empty numeric coordinates without removing zero values', () => {
    dialog.open.mockReturnValue({
      afterClosed: () =>
        of({
          data: {
            value: {
              addressType: 1,
              latitude: 0,
              longitude: ''
            }
          }
        })
    } as any);

    component.addAddress();

    const payload = clientsService.createClientAddress.mock.calls[0][2];
    expect(payload.latitude).toBe(0);
    expect(payload.longitude).toBeUndefined();
    expect(component.clientAddressData[component.clientAddressData.length - 1].latitude).toBe(0);
    expect(component.clientAddressData[component.clientAddressData.length - 1].longitude).toBeUndefined();
  });

  it('should remove coordinates from the add payload when the location feature is disabled', () => {
    environment.enableClientAddressLocation = false;
    dialog.open.mockReturnValue({
      afterClosed: () =>
        of({
          data: {
            value: {
              addressType: 1,
              latitude: 0,
              longitude: '77.5946'
            }
          }
        })
    } as any);

    component.addAddress();

    const payload = clientsService.createClientAddress.mock.calls[0][2];
    expect(payload.latitude).toBeUndefined();
    expect(payload.longitude).toBeUndefined();
    expect(component.clientAddressData[component.clientAddressData.length - 1].latitude).toBeUndefined();
    expect(component.clientAddressData[component.clientAddressData.length - 1].longitude).toBeUndefined();
  });

  it('should preserve zero coordinate values after edit', () => {
    dialog.open.mockReturnValue({
      afterClosed: () =>
        of({
          data: {
            value: {
              latitude: 0,
              longitude: 0
            }
          }
        })
    } as any);

    component.editAddress(component.clientAddressData[0], 0);

    const payload = clientsService.editClientAddress.mock.calls[0][2];
    expect(payload.latitude).toBe(0);
    expect(payload.longitude).toBe(0);
    expect(component.clientAddressData[0].latitude).toBe(0);
    expect(component.clientAddressData[0].longitude).toBe(0);
  });

  it('should apply latitude and longitude min and max validation', () => {
    const formFields = component.getAddressFormFields('add');
    const form = formGroupService.createFormGroup(formFields);

    form.get('latitude')?.setValue(91);
    form.get('longitude')?.setValue(-181);

    expect(form.get('latitude')?.hasError('max')).toBe(true);
    expect(form.get('longitude')?.hasError('min')).toBe(true);
  });

  it('should display saved coordinates and render the map for valid coordinates', () => {
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('12.9716');
    expect(fixture.nativeElement.textContent).toContain('77.5946');
    expect(L.map).toHaveBeenCalledTimes(1);
  });

  it('should not render the map when coordinates are unavailable', () => {
    component.clientAddressData = [
      {
        addressId: 12,
        addressTypeId: 1,
        addressType: 'Home',
        latitude: undefined,
        longitude: undefined
      }
    ];

    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('mifosx-address-location-map')).toBeNull();
    expect(L.map).not.toHaveBeenCalled();
  });

  it('should not display coordinates or render the map when the location feature is disabled', () => {
    environment.enableClientAddressLocation = false;

    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).not.toContain('12.9716');
    expect(fixture.nativeElement.textContent).not.toContain('77.5946');
    expect(fixture.nativeElement.querySelector('mifosx-address-location-map')).toBeNull();
    expect(L.map).not.toHaveBeenCalled();
  });

  it('should handle zero coordinate values correctly', () => {
    component.clientAddressData = [
      {
        addressId: 13,
        addressTypeId: 1,
        addressType: 'Home',
        latitude: 0,
        longitude: '0'
      }
    ];

    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('0');
    expect(fixture.nativeElement.querySelector('mifosx-address-location-map')).not.toBeNull();
    expect(L.map).toHaveBeenCalledTimes(1);
  });
});
