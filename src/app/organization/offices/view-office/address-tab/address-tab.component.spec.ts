/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { MatDialog } from '@angular/material/dialog';
import { TranslateModule } from '@ngx-translate/core';
import { FaIconLibrary } from '@fortawesome/angular-fontawesome';
import { faEdit, faPlus, faTrash } from '@fortawesome/free-solid-svg-icons';
import { of, throwError } from 'rxjs';
import { describe, it, expect, jest, beforeEach } from '@jest/globals';
import * as L from 'leaflet';

import { AddressTabComponent } from './address-tab.component';
import { ClientsService } from 'app/clients/clients.service';
import { AuthenticationService } from 'app/core/authentication/authentication.service';
import { OrganizationService } from 'app/organization/organization.service';
import { PostalCodeLookupService } from 'app/shared/services/postal-code-lookup.service';
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

describe('Office AddressTabComponent', () => {
  let component: AddressTabComponent;
  let fixture: ComponentFixture<AddressTabComponent>;
  let organizationService: jest.Mocked<OrganizationService>;
  let clientsService: jest.Mocked<ClientsService>;
  let dialog: jest.Mocked<MatDialog>;

  const addressTemplate = {
    addressTypeIdOptions: [{ id: 1, name: 'Home' }],
    stateProvinceIdOptions: [{ id: 2, name: 'Karnataka' }],
    countryIdOptions: [{ id: 3, name: 'India' }]
  };

  const officeAddress = {
    officeAddressId: 7,
    officeId: 1,
    addressId: 9,
    addressTypeId: 1,
    street: 'MG Road',
    addressLine1: 'Floor 1',
    city: 'Bengaluru',
    stateProvinceId: 2,
    countryId: 3,
    postalCode: '560001',
    isActive: true
  };

  function dialogRefWithValue(value: any) {
    return {
      afterClosed: () => of({ data: { value } })
    } as any;
  }

  function dialogRefWithDelete() {
    return {
      afterClosed: () => of({ delete: true })
    } as any;
  }

  function endpointNotFoundError() {
    return {
      status: 404,
      error: {
        error: 'Not Found',
        path: '/fineract-provider/api/v2/offices/1/addresses'
      }
    };
  }

  beforeEach(async () => {
    jest.clearAllMocks();
    environment.enableClientAddressLocation = true;

    organizationService = {
      getOfficeAddresses: jest.fn(() => of([officeAddress])),
      createOfficeAddress: jest.fn(() => of({ entityId: 10 })),
      updateOfficeAddress: jest.fn(() => of({ entityId: 7 })),
      deleteOfficeAddress: jest.fn(() => of({ entityId: 7 }))
    } as unknown as jest.Mocked<OrganizationService>;

    clientsService = {
      getClientAddressTemplate: jest.fn(() => of(addressTemplate))
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
            parent: {
              snapshot: {
                paramMap: {
                  get: jest.fn(() => '1')
                }
              }
            }
          }
        },
        { provide: OrganizationService, useValue: organizationService },
        { provide: ClientsService, useValue: clientsService },
        { provide: MatDialog, useValue: dialog },
        { provide: PostalCodeLookupService, useValue: { enabled: false } },
        { provide: AuthenticationService, useValue: { getCredentials: () => ({ permissions: [] as string[] }) } },
        provideNoopAnimations()
      ]
    }).compileComponents();

    TestBed.inject(FaIconLibrary).addIcons(faPlus, faEdit, faTrash);
    fixture = TestBed.createComponent(AddressTabComponent);
    component = fixture.componentInstance;
  });

  it('loads office addresses and address template options', () => {
    fixture.detectChanges();

    expect(organizationService.getOfficeAddresses).toHaveBeenCalledWith('1');
    expect(clientsService.getClientAddressTemplate).toHaveBeenCalled();
    expect(component.officeAddresses).toEqual([officeAddress]);
    expect(component.isLoading).toBe(false);
    expect(component.hasError).toBe(false);
  });

  it('shows an empty state when the office has no address', () => {
    organizationService.getOfficeAddresses.mockReturnValue(of([]));

    fixture.detectChanges();

    const text = fixture.nativeElement.textContent;
    expect(component.officeAddresses).toEqual([]);
    expect(text).toContain('No data found');
  });

  it('shows plugin unavailable state when the office address endpoint is not registered', () => {
    organizationService.getOfficeAddresses.mockReturnValue(throwError(() => endpointNotFoundError()));

    fixture.detectChanges();

    const text = fixture.nativeElement.textContent;
    expect(component.isPluginUnavailable).toBe(true);
    expect(component.hasError).toBe(false);
    expect(component.officeAddresses).toEqual([]);
    expect(text).toContain('labels.text.Office Address management requires the Savings Plugin to be deployed');
    expect(text).not.toContain('errors.generic.unexpectedRetry');
  });

  it('does not open dialogs or call address endpoints when the plugin is unavailable', () => {
    component.isPluginUnavailable = true;

    component.addAddress();
    component.editAddress(officeAddress);
    component.deleteAddress(officeAddress);
    component.toggleAddress(officeAddress);

    expect(dialog.open).not.toHaveBeenCalled();
    expect(organizationService.createOfficeAddress).not.toHaveBeenCalled();
    expect(organizationService.updateOfficeAddress).not.toHaveBeenCalled();
    expect(organizationService.deleteOfficeAddress).not.toHaveBeenCalled();
  });

  it('creates an office address through the plugin endpoint service method', () => {
    fixture.detectChanges();
    dialog.open.mockReturnValue(
      dialogRefWithValue({
        addressTypeId: 1,
        street: 'Church Street',
        city: 'Bengaluru',
        isActive: true
      })
    );

    component.addAddress();

    expect(organizationService.createOfficeAddress).toHaveBeenCalledWith(
      '1',
      expect.objectContaining({
        addressTypeId: 1,
        street: 'Church Street',
        city: 'Bengaluru',
        isActive: true
      })
    );
  });

  it('shows plugin unavailable state when create returns endpoint not found', () => {
    fixture.detectChanges();
    organizationService.createOfficeAddress.mockReturnValue(throwError(() => endpointNotFoundError()));
    dialog.open.mockReturnValue(
      dialogRefWithValue({
        addressTypeId: 1,
        street: 'Church Street',
        city: 'Bengaluru',
        isActive: true
      })
    );

    component.addAddress();

    expect(component.isPluginUnavailable).toBe(true);
    expect(component.hasError).toBe(false);
    expect(component.officeAddresses).toEqual([]);
  });

  it('updates an existing office address by office address id', () => {
    fixture.detectChanges();
    dialog.open.mockReturnValue(
      dialogRefWithValue({
        addressTypeId: 1,
        street: 'Updated Street',
        isActive: false
      })
    );

    component.editAddress(officeAddress);

    expect(organizationService.updateOfficeAddress).toHaveBeenCalledWith(
      '1',
      '7',
      expect.objectContaining({
        street: 'Updated Street',
        isActive: false
      })
    );
  });

  it('handles office addresses without ids without throwing', () => {
    const addressWithoutId: any = {
      ...officeAddress,
      officeAddressId: undefined,
      id: undefined,
      addressId: undefined
    };

    fixture.detectChanges();
    dialog.open.mockClear();

    expect(component.getOfficeAddressId(addressWithoutId)).toBe('');
    expect(component.getOfficeAddressId(addressWithoutId, 3)).toBe('office-address-3');
    expect(() => component.editAddress(addressWithoutId)).not.toThrow();
    expect(() => component.deleteAddress(addressWithoutId)).not.toThrow();
    expect(() => component.toggleAddress(addressWithoutId)).not.toThrow();
    expect(dialog.open).not.toHaveBeenCalled();
    expect(organizationService.updateOfficeAddress).not.toHaveBeenCalled();
    expect(organizationService.deleteOfficeAddress).not.toHaveBeenCalled();
  });

  it('uses translated active status labels', () => {
    expect(component.getActiveStatusLabel(true)).toBe('labels.inputs.Active');
    expect(component.getActiveStatusLabel(false)).toBe('labels.catalogs.Inactive');
  });

  it('deletes an existing office address by office address id', () => {
    fixture.detectChanges();
    dialog.open.mockReturnValue(dialogRefWithDelete());

    component.deleteAddress(officeAddress);

    expect(organizationService.deleteOfficeAddress).toHaveBeenCalledWith('1', '7');
  });

  it('uses address validation metadata in the form dialog fields', () => {
    component.addressTemplate = addressTemplate;

    const formFields = (component as any).getAddressFormFields();

    expect(formFields.find((field: any) => field.controlName === 'addressTypeId')?.required).toBe(true);
    expect(formFields.find((field: any) => field.controlName === 'latitude')).toEqual(
      expect.objectContaining({ min: -90, max: 90 })
    );
    expect(formFields.find((field: any) => field.controlName === 'longitude')).toEqual(
      expect.objectContaining({ min: -180, max: 180 })
    );
  });

  it('shows plugin geolocation fields when the location feature is enabled even if Fineract field config disables them', () => {
    component.addressTemplate = addressTemplate;
    (component as any).clientAddressFieldConfig = [
      { field: 'latitude', isEnabled: false },
      { field: 'longitude', isEnabled: false }
    ];

    const formFields = (component as any).getAddressFormFields();

    expect(formFields.some((field: any) => field.controlName === 'latitude')).toBe(true);
    expect(formFields.some((field: any) => field.controlName === 'longitude')).toBe(true);
  });

  it('hides plugin geolocation fields when the location feature is disabled', () => {
    environment.enableClientAddressLocation = false;
    component.addressTemplate = addressTemplate;

    const formFields = (component as any).getAddressFormFields();

    expect(formFields.some((field: any) => field.controlName === 'latitude')).toBe(false);
    expect(formFields.some((field: any) => field.controlName === 'longitude')).toBe(false);
  });

  it('omits plugin geolocation values from save payloads when the location feature is disabled', () => {
    environment.enableClientAddressLocation = false;
    fixture.detectChanges();
    dialog.open.mockReturnValue(
      dialogRefWithValue({
        addressTypeId: 1,
        street: 'Church Street',
        latitude: '12.9716',
        longitude: '77.5946',
        isActive: true
      })
    );

    component.addAddress();

    const payload = organizationService.createOfficeAddress.mock.calls[0][1];
    expect(payload.latitude).toBeUndefined();
    expect(payload.longitude).toBeUndefined();
  });

  it('renders plugin geolocation values and map for returned coordinates when the location feature is enabled', () => {
    organizationService.getOfficeAddresses.mockReturnValue(
      of([
        {
          ...officeAddress,
          latitude: '12.9716',
          longitude: '77.5946'
        }
      ])
    );

    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('12.9716');
    expect(fixture.nativeElement.textContent).toContain('77.5946');
    expect(fixture.nativeElement.querySelector('mifosx-address-location-map')).not.toBeNull();
    expect(L.map).toHaveBeenCalledTimes(1);
  });

  it('hides plugin geolocation values and map for returned coordinates when the location feature is disabled', () => {
    environment.enableClientAddressLocation = false;
    organizationService.getOfficeAddresses.mockReturnValue(
      of([
        {
          ...officeAddress,
          latitude: '12.9716',
          longitude: '77.5946'
        }
      ])
    );

    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).not.toContain('12.9716');
    expect(fixture.nativeElement.textContent).not.toContain('77.5946');
    expect(fixture.nativeElement.querySelector('mifosx-address-location-map')).toBeNull();
    expect(L.map).not.toHaveBeenCalled();
  });

  it('shows an error state when office address loading fails for non-404 errors', () => {
    organizationService.getOfficeAddresses.mockReturnValue(throwError(() => ({ status: 500 })));

    fixture.detectChanges();

    expect(component.hasError).toBe(true);
    expect(component.isPluginUnavailable).toBe(false);
    expect(component.officeAddresses).toEqual([]);
  });
});
