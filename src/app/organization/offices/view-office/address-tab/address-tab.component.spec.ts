/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap } from '@angular/router';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { MatDialog } from '@angular/material/dialog';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { FaIconLibrary } from '@fortawesome/angular-fontawesome';
import { faEdit, faPlus, faTrash } from '@fortawesome/free-solid-svg-icons';
import { EMPTY, Subject, BehaviorSubject, of, throwError } from 'rxjs';
import { describe, it, expect, jest, beforeEach, afterEach } from '@jest/globals';
import * as L from 'leaflet';
import { FormGroupService } from 'app/shared/form-dialog/form-group.service';

import { Clipboard } from '@angular/cdk/clipboard';
import { AlertService } from 'app/core/alert/alert.service';
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
  const originalRbacSetting = environment.productionModeEnableRBAC;
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
      afterOpened: () => EMPTY,
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
    environment.productionModeEnableRBAC = true;

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
              paramMap: of(convertToParamMap({ officeId: '1' })),
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
        {
          provide: AuthenticationService,
          useValue: { getCredentials: () => ({ permissions: ['ALL_FUNCTIONS'] as string[] }) }
        },
        provideNoopAnimations()
      ]
    }).compileComponents();

    TestBed.inject(FaIconLibrary).addIcons(faPlus, faEdit, faTrash);
    fixture = TestBed.createComponent(AddressTabComponent);
    component = fixture.componentInstance;
    const translateService = TestBed.inject(TranslateService);
    translateService.setTranslation('en', {
      labels: {
        inputs: {
          'Address Line': 'Shared Address Line',
          'Address Line 1': 'Address Line One Label',
          'Address Line 2': 'Address Line Two Label',
          'Address Line 3': 'Address Line Three Label'
        }
      }
    });
    translateService.use('en');
  });

  afterEach(() => {
    jest.useRealTimers();
    environment.productionModeEnableRBAC = originalRbacSetting;
  });

  it('shows saved locations in the read-only summary even when client location entry is disabled', () => {
    environment.enableClientAddressLocation = false;
    component.readOnly = true;
    organizationService.getOfficeAddresses.mockReturnValue(
      of([
        { ...officeAddress, latitude: 0, longitude: 0 },
        { ...officeAddress, officeAddressId: 8, street: 'Second branch address', latitude: 91, longitude: 10 },
        null
      ])
    );
    fixture.detectChanges();
    expect(component.officeAddresses).toHaveLength(2);
    expect(fixture.nativeElement.querySelectorAll('.location-summary')).toHaveLength(2);
    expect(fixture.nativeElement.querySelectorAll('mifosx-address-location-map')).toHaveLength(1);
    expect(fixture.nativeElement.querySelectorAll('.address-actions button')).toHaveLength(0);
    expect(fixture.nativeElement.querySelector('.coordinate-strip button')).not.toBeNull();
    expect(fixture.nativeElement.textContent).toContain('Karnataka');
    expect(fixture.nativeElement.textContent).toContain('India');
    component.addAddress();
    component.editAddress(officeAddress);
    component.deleteAddress(officeAddress);
    component.toggleAddress(officeAddress);
    expect(dialog.open).not.toHaveBeenCalled();
  });

  it('keeps saved address details visible when address catalog loading is forbidden', () => {
    component.readOnly = true;
    clientsService.getClientAddressTemplate.mockReturnValue(throwError(() => ({ status: 403 })));
    fixture.detectChanges();
    expect(component.officeAddresses).toHaveLength(1);
    expect(fixture.nativeElement.textContent).toContain('MG Road');
    expect(component.optionsLoadFailed).toBe(true);
  });

  it('formats only saved address parts without duplicate or empty lines', () => {
    fixture.detectChanges();
    expect(
      component.getPostalLines({ ...officeAddress, addressLine1: ' MG Road ', addressLine2: '', city: 'Karnataka' })
    ).toEqual([
      'MG Road',
      'Karnataka, 560001, India'
    ]);
    expect(component.getPostalLines({})).toEqual([]);
  });

  it('copies the original saved coordinate precision and reports clipboard failure', () => {
    const clipboard = jest.spyOn(TestBed.inject(Clipboard), 'copy').mockReturnValue(true);
    const alert = jest.spyOn(TestBed.inject(AlertService), 'alert');
    const address = { latitude: '12.1234567800', longitude: '-77.1234567890' };
    component.copyCoordinates(address);
    expect(clipboard).toHaveBeenCalledWith('12.1234567800, -77.1234567890');
    expect(alert).toHaveBeenCalledWith(expect.objectContaining({ message: 'errors.clipboard.copied' }));
    clipboard.mockReturnValue(false);
    component.copyCoordinates(address);
    expect(alert).toHaveBeenLastCalledWith(expect.objectContaining({ message: 'errors.clipboard.copyFailed' }));
    component.copyCoordinates({ latitude: 91, longitude: 0 });
    expect(clipboard).toHaveBeenCalledTimes(2);
    expect(component.getMapUrl({ latitude: 91, longitude: 0 })).toBeNull();
    expect(component.getMapUrl({ latitude: 0, longitude: 0 })).toContain('mlat=0&mlon=0');
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
    expect(fixture.nativeElement.querySelector('.action-button button')).not.toBeNull();
  });

  it('hides the add action and prevents the add dialog when the office already has an address', () => {
    fixture.detectChanges();

    expect(component.hasOfficeAddress).toBe(true);
    expect(component.canAddAddress).toBe(false);
    expect(fixture.nativeElement.querySelector('.action-button button')).toBeNull();

    component.addAddress();

    expect(dialog.open).not.toHaveBeenCalled();
    expect(organizationService.createOfficeAddress).not.toHaveBeenCalled();
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
    organizationService.getOfficeAddresses.mockReturnValue(of([]));
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
    organizationService.getOfficeAddresses.mockReturnValue(of([]));
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

  it('should use independent address line translation keys in office address forms', () => {
    const formFields = (component as any).getAddressFormFields(officeAddress);

    expect(formFields.find((field: any) => field.controlName === 'addressLine1')?.label).toBe('Address Line One Label');
    expect(formFields.find((field: any) => field.controlName === 'addressLine2')?.label).toBe('Address Line Two Label');
    expect(formFields.find((field: any) => field.controlName === 'addressLine3')?.label).toBe(
      'Address Line Three Label'
    );
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

  it('enables the add action again after the existing address is deleted', () => {
    organizationService.getOfficeAddresses.mockReturnValueOnce(of([officeAddress])).mockReturnValueOnce(of([]));
    fixture.detectChanges();
    dialog.open.mockReturnValue(dialogRefWithDelete());

    component.deleteAddress(officeAddress);
    fixture.detectChanges();

    expect(organizationService.deleteOfficeAddress).toHaveBeenCalledWith('1', '7');
    expect(component.officeAddresses).toEqual([]);
    expect(component.hasOfficeAddress).toBe(false);
    expect(component.canAddAddress).toBe(true);
    expect(fixture.nativeElement.querySelector('.action-button button')).not.toBeNull();
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

  it('exposes office coordinate fields when client location entry is disabled', () => {
    environment.enableClientAddressLocation = false;
    component.addressTemplate = addressTemplate;

    const formFields = (component as any).getAddressFormFields();

    expect(formFields.some((field: any) => field.controlName === 'latitude')).toBe(true);
    expect(formFields.some((field: any) => field.controlName === 'longitude')).toBe(true);
  });

  it('saves office coordinates independently of the client location flag', () => {
    environment.enableClientAddressLocation = false;
    organizationService.getOfficeAddresses.mockReturnValue(of([]));
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
    expect(payload.latitude).toBe('12.9716');
    expect(payload.longitude).toBe('77.5946');
  });

  it('preserves latitude and longitude in create payloads when the location feature is enabled', () => {
    organizationService.getOfficeAddresses.mockReturnValue(of([]));
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
    expect(payload.locale).toBe('en');
    expect(payload.latitude).toBe('12.9716');
    expect(payload.longitude).toBe('77.5946');
  });

  it('preserves latitude and longitude in edit payloads when the location feature is enabled', () => {
    const officeAddressWithCoordinates = {
      ...officeAddress,
      latitude: '12.9716',
      longitude: '77.5946'
    };
    fixture.detectChanges();
    dialog.open.mockReturnValue(
      dialogRefWithValue({
        ...officeAddressWithCoordinates,
        locale: 'en',
        latitude: '13',
        longitude: '78'
      })
    );

    component.editAddress(officeAddressWithCoordinates);

    expect(organizationService.updateOfficeAddress).toHaveBeenCalledWith(
      '1',
      '7',
      expect.objectContaining({
        locale: 'en',
        latitude: '13',
        longitude: '78'
      })
    );
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

  it('refreshes displayed coordinates and map position after editing an address location', () => {
    const initialAddress = {
      ...officeAddress,
      latitude: '12.9716',
      longitude: '77.5946'
    };
    const updatedAddress = {
      ...officeAddress,
      latitude: '13',
      longitude: '78'
    };
    organizationService.getOfficeAddresses
      .mockReturnValueOnce(of([initialAddress]))
      .mockReturnValueOnce(of([updatedAddress]));
    fixture.detectChanges();
    dialog.open.mockReturnValue(dialogRefWithValue(updatedAddress));

    component.editAddress(initialAddress);
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('13');
    expect(fixture.nativeElement.textContent).toContain('78');
    expect(fixture.nativeElement.querySelector('mifosx-address-location-map')).not.toBeNull();
    expect(mockMapSetView).toHaveBeenCalledWith(
      [
        13,
        78
      ],
      15
    );
  });

  it('does not render a map when coordinates are missing', () => {
    organizationService.getOfficeAddresses.mockReturnValue(of([officeAddress]));

    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('mifosx-address-location-map')).toBeNull();
    expect(L.map).not.toHaveBeenCalled();
  });

  it('shows office coordinates and map when client location entry is disabled', () => {
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

    expect(fixture.nativeElement.textContent).toContain('12.9716');
    expect(fixture.nativeElement.textContent).toContain('77.5946');
    expect(fixture.nativeElement.querySelector('mifosx-address-location-map')).not.toBeNull();
    expect(L.map).toHaveBeenCalledTimes(1);
  });

  it('shows an error state when office address loading fails for non-404 errors', () => {
    organizationService.getOfficeAddresses.mockReturnValue(throwError(() => ({ status: 500 })));

    fixture.detectChanges();

    expect(component.hasError).toBe(true);
    expect(component.isPluginUnavailable).toBe(false);
    expect(component.officeAddresses).toEqual([]);
    expect(component.canAddAddress).toBe(false);
    expect(fixture.nativeElement.querySelector('.action-button button:disabled')).not.toBeNull();

    component.addAddress();

    expect(dialog.open).not.toHaveBeenCalled();
    expect(organizationService.createOfficeAddress).not.toHaveBeenCalled();
  });
  it.each([
    [
      -90,
      -180
    ],
    [
      90,
      180
    ],
    [
      0,
      0
    ],
    [
      '19.43260812',
      '-99.13320912'
    ],
    [
      '',
      ''
    ]
  ])('accepts the valid coordinate pair %s, %s', (latitude, longitude) => {
    const form = TestBed.inject(FormGroupService).createFormGroup(
      (component as any).getAddressFormFields(officeAddress)
    );
    form.patchValue({ latitude, longitude });
    form.get('latitude').updateValueAndValidity();
    form.get('longitude').updateValueAndValidity();
    expect(form.valid).toBe(true);
  });

  it.each([
    [
      91,
      0
    ],
    [
      -91,
      0
    ],
    [
      0,
      181
    ],
    [
      0,
      -181
    ],
    [
      NaN,
      0
    ],
    [
      0,
      Infinity
    ],
    [
      'not a number',
      0
    ],
    [
      '19.4.3',
      0
    ],
    [
      0,
      ''
    ],
    [
      '',
      0
    ]
  ])('rejects the invalid coordinate pair %s, %s and never writes it', (latitude, longitude) => {
    const form = TestBed.inject(FormGroupService).createFormGroup(
      (component as any).getAddressFormFields(officeAddress)
    );
    form.patchValue({ latitude, longitude });
    form.get('latitude').updateValueAndValidity();
    form.get('longitude').updateValueAndValidity();
    expect(form.invalid).toBe(true);
    fixture.detectChanges();
    dialog.open.mockReturnValue(dialogRefWithValue({ ...officeAddress, latitude, longitude }));
    component.editAddress(officeAddress);
    expect(organizationService.updateOfficeAddress).not.toHaveBeenCalled();
  });

  it('revalidates both controls as a pair is entered, cleared, and the dialog closes', () => {
    const form = TestBed.inject(FormGroupService).createFormGroup(
      (component as any).getAddressFormFields(officeAddress)
    );
    const opened = new Subject<void>();
    const closed = new Subject<void>();
    (component as any).setupCoordinateValidation({
      afterOpened: () => opened,
      afterClosed: () => closed,
      componentInstance: { form }
    });
    opened.next();
    form.get('latitude').setValue(0);
    expect(form.get('longitude').hasError('required')).toBe(true);
    form.get('longitude').setValue(0);
    expect(form.valid).toBe(true);
    form.get('latitude').setValue('');
    expect(form.get('latitude').hasError('required')).toBe(true);
    form.get('longitude').setValue('');
    expect(form.valid).toBe(true);
    closed.next();
    const validate = jest.spyOn(form.get('longitude'), 'updateValueAndValidity');
    form.get('latitude').setValue(1);
    expect(validate).not.toHaveBeenCalled();
  });

  it.each([
    'close',
    'office change',
    'destroy'
  ])('cleans up postal lookups on %s', (reason: string) => {
    jest.useFakeTimers();
    const params = new BehaviorSubject(convertToParamMap({ officeId: '1' }));
    (TestBed.inject(ActivatedRoute).parent as any).paramMap = params;
    fixture.detectChanges();
    const pending = new Subject<any>();
    const postal = TestBed.inject(PostalCodeLookupService);
    const lookup = jest.fn(() => pending);
    const resolve = jest.fn(() => ({ city: 'Resolved city' }));
    Object.assign(postal, { enabled: true, lookupWithFallback: lookup, toResolvedAddress: resolve });
    const form = TestBed.inject(FormGroupService).createFormGroup(
      (component as any).getAddressFormFields(officeAddress)
    );
    form.get('countryId').setValue(null);
    const opened = new Subject<void>();
    const closed = new Subject<void>();
    dialog.open.mockReturnValue({
      afterOpened: () => opened,
      afterClosed: () => closed,
      componentInstance: { form }
    } as any);
    component.editAddress(officeAddress);
    opened.next();
    form.get('postalCode').setValue('10000');
    jest.advanceTimersByTime(600);
    pending.next({});
    expect(form.get('city').value).toBe('Resolved city');
    expect((component as any).autoFilledFields.size).toBe(1);
    form.get('postalCode').setValue('20000');
    jest.advanceTimersByTime(600);
    expect(pending.observed).toBe(true);

    if (reason === 'close') {
      closed.next();
      closed.complete();
    } else if (reason === 'office change') params.next(convertToParamMap({ officeId: '2' }));
    else fixture.destroy();

    expect(pending.observed).toBe(false);
    expect((component as any).autoFilledFields.size).toBe(0);
    pending.next({});
    form.get('postalCode').setValue('30000');
    jest.advanceTimersByTime(600);
    expect(resolve).toHaveBeenCalledTimes(1);
    expect(lookup).toHaveBeenCalledTimes(2);
  });

  it('preserves coordinates and all address fields when only the postal code changes', () => {
    const saved = {
      ...officeAddress,
      latitude: 19.43260812,
      longitude: -99.13320912,
      addressLine2: 'Second line',
      addressLine3: 'Third line',
      townVillage: 'Town',
      countyDistrict: 'County'
    };
    const fields = (component as any).getAddressFormFields(saved);
    const form = TestBed.inject(FormGroupService).createFormGroup(fields);
    form.get('postalCode').setValue('09300');
    fixture.detectChanges();
    dialog.open.mockReturnValue(dialogRefWithValue(form.value));
    component.editAddress(saved);
    expect(organizationService.updateOfficeAddress).toHaveBeenCalledWith('1', '7', {
      ...form.value,
      locale: 'en'
    });
  });

  it('distinguishes omitted coordinates from deliberately clearing both coordinates', () => {
    const omitted = (component as any).normalizeAddressData({ ...officeAddress });
    expect(omitted).not.toHaveProperty('latitude');
    expect(omitted).not.toHaveProperty('longitude');
    const undefinedValues = (component as any).normalizeAddressData({
      ...officeAddress,
      latitude: undefined,
      longitude: undefined
    });
    expect(undefinedValues).not.toHaveProperty('latitude');
    expect(undefinedValues).not.toHaveProperty('longitude');
    const cleared = (component as any).normalizeAddressData({ ...officeAddress, latitude: '', longitude: null });
    expect(cleared).toMatchObject({ latitude: null, longitude: null, locale: 'en' });
  });

  it('cancels editing without a write or refreshing the saved data', () => {
    fixture.detectChanges();
    dialog.open.mockReturnValue({ afterOpened: () => EMPTY, afterClosed: () => of(undefined) } as any);
    component.editAddress(officeAddress);
    expect(organizationService.updateOfficeAddress).not.toHaveBeenCalled();
    expect(organizationService.getOfficeAddresses).toHaveBeenCalledTimes(1);
  });

  it.each([
    0,
    400,
    403,
    404,
    500
  ])('retains saved data and reports failed writes (HTTP %s)', (status) => {
    fixture.detectChanges();
    organizationService.updateOfficeAddress.mockReturnValue(throwError(() => ({ status })));
    dialog.open.mockReturnValue(dialogRefWithValue({ ...officeAddress, latitude: 0, longitude: 0 }));
    component.editAddress(officeAddress);
    expect(component.officeAddresses).toEqual([officeAddress]);
    expect(component.hasError).toBe(true);
    expect(component.isSaving).toBe(false);
    expect(organizationService.getOfficeAddresses).toHaveBeenCalledTimes(1);
  });

  it('prevents a READ_OFFICE user from mutating addresses, including direct handler calls', () => {
    jest
      .spyOn(TestBed.inject(AuthenticationService), 'getCredentials')
      .mockReturnValue({ permissions: ['READ_OFFICE'] } as any);
    fixture.detectChanges();
    component.editAddress(officeAddress);
    component.toggleAddress(officeAddress);
    component.deleteAddress(officeAddress);
    component.officeAddresses = [];
    component.addAddress();
    expect(dialog.open).not.toHaveBeenCalled();
    expect(component.canAddAddress).toBe(false);
    expect(organizationService.updateOfficeAddress).not.toHaveBeenCalled();
    expect(organizationService.deleteOfficeAddress).not.toHaveBeenCalled();
  });
  it('passes translation keys to the dialog to avoid translating Spanish button text twice', () => {
    const translate = TestBed.inject(TranslateService);
    translate.setTranslation('es', { labels: { buttons: { Edit: 'Editar', Submit: 'Enviar' } } });
    translate.use('es');
    fixture.detectChanges();
    dialog.open.mockReturnValue({ afterOpened: () => EMPTY, afterClosed: () => of(undefined) } as any);
    component.editAddress(officeAddress);
    expect((dialog.open.mock.calls[0][1] as any).data.layout.addButtonText).toBe('labels.buttons.Edit');
    component.officeAddresses = [];
    component.addAddress();
    expect((dialog.open.mock.calls[1][1] as any).data.layout.addButtonText).toBe('labels.buttons.Submit');
  });
  it.each([
    [
      '5e-8',
      '0.00000005'
    ],
    [
      '-5e-8',
      '-0.00000005'
    ],
    [
      '+5E-8',
      '0.00000005'
    ],
    [
      '1.234567e-2',
      '0.01234567'
    ],
    [
      '1.943260812e1',
      '19.43260812'
    ],
    [
      '5e1',
      '50'
    ],
    [
      '.5e-7',
      '0.00000005'
    ],
    [
      '0e999999999',
      '0'
    ],
    [
      '0E-8',
      '0'
    ],
    [
      '-89.13320912',
      '-89.13320912'
    ],
    [
      5e-8,
      5e-8
    ]
  ])('serializes coordinate %s as %s without rounding', (input, expected) => {
    fixture.detectChanges();
    dialog.open.mockReturnValue(dialogRefWithValue({ ...officeAddress, latitude: input, longitude: '-5e-8' }));
    component.editAddress(officeAddress);
    expect(organizationService.updateOfficeAddress).toHaveBeenCalledWith(
      '1',
      '7',
      expect.objectContaining({
        latitude: expected,
        longitude: '-0.00000005',
        locale: 'en'
      })
    );
  });

  it('serializes exponent coordinates on address creation as well as editing', () => {
    organizationService.getOfficeAddresses.mockReturnValue(of([]));
    fixture.detectChanges();
    dialog.open.mockReturnValue(dialogRefWithValue({ ...officeAddress, latitude: '5e-8', longitude: '-5e-8' }));
    component.addAddress();
    expect(organizationService.createOfficeAddress).toHaveBeenCalledWith(
      '1',
      expect.objectContaining({
        latitude: '0.00000005',
        longitude: '-0.00000005',
        locale: 'en'
      })
    );
  });

  it.each([
    'CREATE_OFFICE',
    'UPDATE_OFFICE',
    'DELETE_OFFICE'
  ] as const)(
    'allows %s without explicit permissions when RBAC is disabled, but keeps summaries read-only',
    (permission) => {
      environment.productionModeEnableRBAC = false;
      jest.spyOn(TestBed.inject(AuthenticationService), 'getCredentials').mockReturnValue({ permissions: [] } as any);
      expect(component.canManageAddress(permission)).toBe(true);
      component.readOnly = true;
      expect(component.canManageAddress(permission)).toBe(false);
    }
  );

  it.each([
    'CREATE_OFFICE',
    'UPDATE_OFFICE',
    'DELETE_OFFICE'
  ] as const)('requires %s or ALL_FUNCTIONS when RBAC is enabled', (permission) => {
    const credentials = jest.spyOn(TestBed.inject(AuthenticationService), 'getCredentials');
    credentials.mockReturnValue({ permissions: ['ALL_FUNCTIONS_READ'] } as any);
    expect(component.canManageAddress(permission)).toBe(false);
    credentials.mockReturnValue({ permissions: [permission] } as any);
    expect(component.canManageAddress(permission)).toBe(true);
    credentials.mockReturnValue({ permissions: ['ALL_FUNCTIONS'] } as any);
    expect(component.canManageAddress(permission)).toBe(true);
    component.readOnly = true;
    expect(component.canManageAddress(permission)).toBe(false);
  });
  it.each([
    '0.12345678',
    '-0.1234567800',
    '1e-8',
    '-5e-8',
    '1.23456789e1',
    '1.23456780e-1',
    '1000e-11',
    '0.000000000',
    '0e-999999999',
    0.12345678
  ])('accepts coordinate %s when its expanded value fits eight decimal places', (value) => {
    const form = TestBed.inject(FormGroupService).createFormGroup(
      (component as any).getAddressFormFields(officeAddress)
    );
    form.patchValue({ latitude: value, longitude: value });
    form.get('latitude').updateValueAndValidity();
    form.get('longitude').updateValueAndValidity();
    expect(form.valid).toBe(true);
  });

  it.each([
    '0.123456789',
    '-0.123456789',
    '1e-9',
    '-5e-9',
    '1.23456789e-2',
    '1000e-12',
    '1e-999999999',
    0.123456789,
    5e-9
  ])('rejects over-precision coordinate %s for either axis and prevents update requests', (value) => {
    const form = TestBed.inject(FormGroupService).createFormGroup(
      (component as any).getAddressFormFields(officeAddress)
    );
    fixture.detectChanges();
    for (const axis of [
      'latitude',
      'longitude'
    ]) {
      form.patchValue({ latitude: 0, longitude: 0, [axis]: value });
      form.get('latitude').updateValueAndValidity();
      form.get('longitude').updateValueAndValidity();
      expect(form.get(axis).getError('maxDecimals')).toEqual({ decimals: 8 });
      expect(form.invalid).toBe(true);
      dialog.open.mockReturnValue(dialogRefWithValue(form.value));
      component.editAddress(officeAddress);
    }
    expect(organizationService.updateOfficeAddress).not.toHaveBeenCalled();
  });

  it('prevents creation with over-precision coordinates without changing the supplied values', () => {
    organizationService.getOfficeAddresses.mockReturnValue(of([]));
    fixture.detectChanges();
    const values = { ...officeAddress, latitude: '1e-9', longitude: '-0.123456789' };
    dialog.open.mockReturnValue(dialogRefWithValue(values));
    component.addAddress();
    expect(organizationService.createOfficeAddress).not.toHaveBeenCalled();
    expect(values).toMatchObject({ latitude: '1e-9', longitude: '-0.123456789' });
  });
});
