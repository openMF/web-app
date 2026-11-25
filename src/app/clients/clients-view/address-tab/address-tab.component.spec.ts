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
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { BehaviorSubject, EMPTY, of, Subject, throwError } from 'rxjs';
import { describe, it, expect, jest, beforeEach, afterEach } from '@jest/globals';
import * as L from 'leaflet';
import { FaIconLibrary } from '@fortawesome/angular-fontawesome';
import * as solidIcons from '@fortawesome/free-solid-svg-icons';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { By } from '@angular/platform-browser';
import { MatExpansionPanel } from '@angular/material/expansion';

import { AddressTabComponent } from './address-tab.component';
import { ClientsService } from '../../clients.service';
import { PostalCodeLookupService } from 'app/shared/services/postal-code-lookup.service';
import { FormGroupService } from 'app/shared/form-dialog/form-group.service';
import { environment } from 'environments/environment';
import { AuthenticationService } from 'app/core/authentication/authentication.service';

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
  let translateService: TranslateService;
  let savedAddresses: any[];
  let permissions: string[];
  const originalLocationFlag = environment.enableClientAddressLocation;
  const originalRbacFlag = environment.productionModeEnableRBAC;

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
    environment.productionModeEnableRBAC = true;
    permissions = ['ALL_FUNCTIONS'];

    routeData = new BehaviorSubject({
      clientAddressData: [
        {
          addressId: 11,
          addressTypeId: 1,
          addressType: 'Home',
          street: 'MG Road',
          addressLine1: 'Line 1',
          addressLine2: 'Line 2',
          addressLine3: 'Line 3',
          townVillage: 'Indiranagar',
          city: 'Bengaluru',
          stateProvinceId: 2,
          countyDistrict: 'Bangalore Urban',
          countryId: 3,
          postalCode: '560038',
          latitude: '12.9716',
          longitude: '77.5946',
          isActive: true
        }
      ],
      clientAddressFieldConfig: fieldConfiguration(),
      clientAddressTemplateData: addressTemplate
    });

    savedAddresses = routeData.value.clientAddressData.map((address: any) => ({ ...address }));
    clientsService = {
      createClientAddress: jest.fn((_clientId: string, _type: string, data: any) => {
        savedAddresses.push({ ...data, addressId: 22, addressTypeId: 1, addressType: 'Home', isActive: false });
        return of({ resourceId: 22 });
      }),
      editClientAddress: jest.fn((_clientId: string, _type: string, data: any) => {
        savedAddresses = savedAddresses.map((address) =>
          address.addressId === data.addressId ? { ...address, ...data } : address
        );
        return of({ resourceId: 11 });
      }),
      getClientAddressData: jest.fn(() => of(savedAddresses.map((address) => ({ ...address }))))
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
        { provide: AuthenticationService, useValue: { getCredentials: () => ({ permissions }) } },
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
    translateService = TestBed.inject(TranslateService);
    translateService.setTranslation('en', {
      labels: {
        buttons: {
          Yes: 'Yes',
          No: 'No'
        },
        inputs: {
          'Address Line': 'Shared Address Line',
          'Address Line 1': 'Address Line One Label',
          'Address Line 2': 'Address Line Two Label',
          'Address Line 3': 'Address Line Three Label'
        }
      }
    });
    translateService.setDefaultLang('en');
    translateService.use('en');
  });

  afterEach(() => {
    environment.enableClientAddressLocation = originalLocationFlag;
    environment.productionModeEnableRBAC = originalRbacFlag;
  });

  function expandFirstAddressPanel() {
    const panel = fixture.debugElement.query(By.directive(MatExpansionPanel)).componentInstance as MatExpansionPanel;
    panel.open();
    fixture.detectChanges();
  }

  function collapseFirstAddressPanel() {
    const panel = fixture.debugElement.query(By.directive(MatExpansionPanel)).componentInstance as MatExpansionPanel;
    panel.close();
    fixture.detectChanges();
  }

  function getActiveStatusElement(): HTMLElement {
    const element = fixture.nativeElement.querySelector('[data-testid="client-address-active-status"]') as HTMLElement;

    expect(element).not.toBeNull();

    return element;
  }

  it('should show latitude and longitude fields when enabled', () => {
    const formFields = component.getAddressFormFields('add');

    expect(formFields.some((field) => field.controlName === 'latitude')).toBe(true);
    expect(formFields.some((field) => field.controlName === 'longitude')).toBe(true);
  });

  it('should include the missing address form controls with backend field names', () => {
    const formFields = component.getAddressFormFields('add');

    expect(formFields.some((field) => field.controlName === 'street')).toBe(true);
    expect(formFields.some((field) => field.controlName === 'townVillage')).toBe(true);
    expect(formFields.some((field) => field.controlName === 'countyDistrict')).toBe(true);
  });

  it('should use independent address line translation keys in add and edit forms', () => {
    const addFormFields = component.getAddressFormFields('add');
    const editFormFields = component.getAddressFormFields('edit', component.clientAddressData[0]);

    [
      addFormFields,
      editFormFields
    ].forEach((formFields) => {
      expect(formFields.find((field) => field.controlName === 'addressLine1')?.label).toBe('Address Line One Label');
      expect(formFields.find((field) => field.controlName === 'addressLine2')?.label).toBe('Address Line Two Label');
      expect(formFields.find((field) => field.controlName === 'addressLine3')?.label).toBe('Address Line Three Label');
    });
  });

  it('should populate missing address fields when editing', () => {
    const formFields = component.getAddressFormFields('edit', component.clientAddressData[0]);

    expect(formFields.find((field) => field.controlName === 'street')?.value).toBe('MG Road');
    expect(formFields.find((field) => field.controlName === 'townVillage')?.value).toBe('Indiranagar');
    expect(formFields.find((field) => field.controlName === 'countyDistrict')?.value).toBe('Bangalore Urban');
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

  it('should include address fields in the add payload', () => {
    dialog.open.mockReturnValue({
      afterOpened: () => EMPTY,
      afterClosed: () =>
        of({
          data: {
            value: {
              addressType: 1,
              street: 'Church Street',
              addressLine1: 'Apartment 4',
              addressLine2: 'Near Metro',
              addressLine3: 'Block A',
              townVillage: 'MG Layout',
              countyDistrict: 'Central District',
              city: 'Bengaluru',
              postalCode: '560001',
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
        street: 'Church Street',
        addressLine1: 'Apartment 4',
        addressLine2: 'Near Metro',
        addressLine3: 'Block A',
        townVillage: 'MG Layout',
        countyDistrict: 'Central District',
        city: 'Bengaluru',
        postalCode: '560001',
        latitude: '12.9716',
        longitude: '77.5946'
      })
    );
    expect(component.clientAddressData[component.clientAddressData.length - 1]).toEqual(
      expect.objectContaining({
        street: 'Church Street',
        townVillage: 'MG Layout',
        countyDistrict: 'Central District',
        latitude: '12.9716',
        longitude: '77.5946'
      })
    );
  });

  it('should pass the location map preview template to the add dialog', () => {
    fixture.detectChanges();
    dialog.open.mockReturnValue({
      afterOpened: () => EMPTY,
      afterClosed: () => of({})
    } as any);

    component.addAddress();

    const dialogConfig = dialog.open.mock.calls[0][1] as { data: any };
    expect(dialogConfig.data.contentTemplate).toBe(component.addressLocationMapDialogTemplate);
  });

  it('should include address fields in the edit payload', () => {
    dialog.open.mockReturnValue({
      afterOpened: () => EMPTY,
      afterClosed: () =>
        of({
          data: {
            value: {
              street: 'Updated Street',
              addressLine1: 'Updated Line 1',
              addressLine2: 'Updated Line 2',
              addressLine3: 'Updated Line 3',
              townVillage: 'Updated Village',
              countyDistrict: 'Updated District',
              city: 'Mysuru',
              postalCode: '570001',
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
        street: 'Updated Street',
        addressLine1: 'Updated Line 1',
        addressLine2: 'Updated Line 2',
        addressLine3: 'Updated Line 3',
        townVillage: 'Updated Village',
        countyDistrict: 'Updated District',
        city: 'Mysuru',
        postalCode: '570001',
        latitude: '13',
        longitude: '78'
      })
    );
    expect(component.clientAddressData[0]).toEqual(
      expect.objectContaining({
        street: 'Updated Street',
        townVillage: 'Updated Village',
        countyDistrict: 'Updated District',
        latitude: '13',
        longitude: '78'
      })
    );
  });

  it('should remove empty numeric coordinates without removing zero values', () => {
    dialog.open.mockReturnValue({
      afterOpened: () => EMPTY,
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
      afterOpened: () => EMPTY,
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
      afterOpened: () => EMPTY,
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

  it('should display returned missing address fields', () => {
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('MG Road');
    expect(fixture.nativeElement.textContent).toContain('Indiranagar');
    expect(fixture.nativeElement.textContent).toContain('Bangalore Urban');
  });

  it('should display active address status as translated Yes', () => {
    component.clientAddressData[0].isActive = true;

    fixture.detectChanges();

    const activeStatusElement = getActiveStatusElement();
    expect(activeStatusElement.textContent).toContain('Yes');
    expect(activeStatusElement.textContent).not.toContain('true');
  });

  it('should display inactive address status as translated No', () => {
    component.clientAddressData[0].isActive = false;

    fixture.detectChanges();

    const activeStatusElement = getActiveStatusElement();
    expect(activeStatusElement.textContent).toContain('No');
    expect(activeStatusElement.textContent).not.toContain('false');
  });

  it('should display address active status using non-English translations', () => {
    translateService.setTranslation('fr', {
      labels: {
        buttons: {
          Yes: 'Oui',
          No: 'Non'
        }
      }
    });
    translateService.use('fr');
    component.clientAddressData[0].isActive = false;

    fixture.detectChanges();

    const activeStatusElement = getActiveStatusElement();
    expect(activeStatusElement.textContent).toContain('Non');
    expect(activeStatusElement.textContent).not.toContain('false');
  });

  it('should display saved coordinates and render the map for valid coordinates', () => {
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('12.9716');
    expect(fixture.nativeElement.textContent).toContain('77.5946');
    expect(L.map).not.toHaveBeenCalled();

    expandFirstAddressPanel();

    expect(L.map).toHaveBeenCalledTimes(1);
  });

  it('should recreate the map cleanly when the address panel is reopened', () => {
    fixture.detectChanges();

    expandFirstAddressPanel();
    collapseFirstAddressPanel();
    expandFirstAddressPanel();

    expect(L.map).toHaveBeenCalledTimes(2);
    expect(mockMapRemove).toHaveBeenCalledTimes(1);
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
    expandFirstAddressPanel();

    expect(fixture.nativeElement.querySelector('mifosx-address-location-map')).not.toBeNull();
    expect(L.map).toHaveBeenCalledTimes(1);
  });
  function closeDialogWith(value: any, valid = true) {
    dialog.open.mockReturnValue({ afterOpened: () => EMPTY, afterClosed: () => of({ data: { value, valid } }) } as any);
  }

  it('waits for the authoritative read and retains backend metadata and unchanged fields', () => {
    const read = new Subject<any>();
    const original = component.clientAddressData;
    clientsService.getClientAddressData.mockReturnValue(read);
    closeDialogWith({ latitude: '28.6139123456789', longitude: '77.2090123456789' });
    component.editAddress(original[0], 0);
    expect(component.clientAddressData).toBe(original);
    expect(clientsService.getClientAddressData).toHaveBeenCalledWith('7');
    const saved = [{ ...original[0], latitude: '28.61391234', longitude: '77.20901234', updatedBy: 'server' }];
    read.next(saved);
    expect(component.clientAddressData).toBe(saved);
    expect(component.clientAddressData[0].street).toBe('MG Road');
    expect(component.clientAddressData[0].updatedBy).toBe('server');
    expect(clientsService.editClientAddress.mock.calls[0][2].latitude).toBe('28.6139123456789');
  });

  it.each([
    'create',
    'edit',
    'read'
  ])('does not invent saved state when %s fails', (kind) => {
    const original = component.clientAddressData;
    const failure = throwError(() => ({ status: 403 }));
    if (kind === 'create') clientsService.createClientAddress.mockReturnValue(failure);
    else if (kind === 'edit') clientsService.editClientAddress.mockReturnValue(failure);
    else clientsService.getClientAddressData.mockReturnValue(failure);
    closeDialogWith({ addressType: 1, latitude: '28.6139', longitude: '77.2090' });
    if (kind === 'edit') component.editAddress(original[0], 0);
    else component.addAddress();
    expect(component.clientAddressData).toBe(original);
    if (kind !== 'read') expect(clientsService.getClientAddressData).not.toHaveBeenCalled();
  });

  it('does not treat omitted coordinates as a successful backend clear', () => {
    closeDialogWith({ latitude: '', longitude: '' });
    component.editAddress(component.clientAddressData[0], 0);
    const payload = clientsService.editClientAddress.mock.calls[0][2];
    expect(payload.latitude).toBeUndefined();
    expect(payload.longitude).toBeUndefined();
    expect(component.clientAddressData[0]).toEqual(
      expect.objectContaining({ latitude: '12.9716', longitude: '77.5946' })
    );
  });

  it.each([
    [
      true,
      false
    ],
    [
      false,
      true
    ],
    [
      false,
      false
    ]
  ])('omits disabled coordinates on add and edit (%s, %s)', (latitude, longitude) => {
    component.clientAddressFieldConfig = fieldConfiguration(latitude, longitude);
    closeDialogWith({ addressType: 1, latitude: 0, longitude: 0 });
    component.addAddress();
    component.editAddress(component.clientAddressData[0], 0);
    for (const payload of [
      clientsService.createClientAddress.mock.calls[0][2],
      clientsService.editClientAddress.mock.calls[0][2]
    ]) {
      expect(payload.latitude).toBe(latitude ? 0 : undefined);
      expect(payload.longitude).toBe(longitude ? 0 : undefined);
    }
  });

  it.each([
    'abc',
    '12junk',
    'Infinity',
    '1e'
  ])('blocks malformed coordinate input %s in reactive dialogs', (value) => {
    const form = formGroupService.createFormGroup(
      component.getAddressFormFields('edit', component.clientAddressData[0])
    );
    form.get('latitude').setValue(value);
    expect(form.get('latitude').hasError('invalidNumber')).toBe(true);
    dialog.open.mockReturnValue({ afterOpened: () => EMPTY, afterClosed: () => of({ data: form }) } as any);
    component.editAddress(component.clientAddressData[0], 0);
    expect(clientsService.editClientAddress).not.toHaveBeenCalled();
  });

  it('preserves high precision and optional partial pairs in decimal text controls', () => {
    const fields = component.getAddressFormFields('add');
    const form = formGroupService.createFormGroup(fields);
    form.get('latitude').setValue('28.6139123456789');
    expect(form.get('latitude').valid).toBe(true);
    expect(form.get('longitude').valid).toBe(true);
    expect(fields.find((field) => field.controlName === 'latitude')).toEqual(
      expect.objectContaining({ type: 'text', inputmode: 'decimal', step: null })
    );
  });

  it.each([
    { grants: [] },
    { grants: ['READ_ADDRESS'] },
    { grants: ['ALL_FUNCTIONS_READ'] }
  ])('keeps addresses and maps read-only for permissions $grants', ({ grants }) => {
    permissions = grants;
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('button[color="primary"]')).toBeNull();
    expect(fixture.nativeElement.querySelector('mat-slide-toggle button[role="switch"]').disabled).toBe(true);
    component.addAddress();
    component.editAddress(component.clientAddressData[0], 0);
    component.toggleAddress(component.clientAddressData[0]);
    expect(dialog.open).not.toHaveBeenCalled();
    expect(clientsService.editClientAddress).not.toHaveBeenCalled();
    expandFirstAddressPanel();
    expect(L.map).toHaveBeenCalledTimes(1);
  });

  it('checks create and update permissions independently', () => {
    permissions = ['CREATE_ADDRESS'];
    expect(component.canManageAddress('CREATE_ADDRESS')).toBe(true);
    expect(component.canManageAddress('UPDATE_ADDRESS')).toBe(false);
    permissions = ['UPDATE_ADDRESS'];
    expect(component.canManageAddress('CREATE_ADDRESS')).toBe(false);
    expect(component.canManageAddress('UPDATE_ADDRESS')).toBe(true);
  });

  it('handles missing template and field configuration without opening an unusable dialog', () => {
    component.clientAddressTemplate = null;
    component.clientAddressFieldConfig = null;
    expect(component.getAddressFormFields('add')).toEqual([]);
    expect(component.isFieldEnabled('latitude')).toBe(false);
    component.addAddress();
    expect(dialog.open).not.toHaveBeenCalled();
    expect(() => fixture.detectChanges()).not.toThrow();
  });

  it('shows a localized fallback for partial or invalid coordinates without hiding address data', () => {
    component.clientAddressData[0].longitude = null;
    fixture.detectChanges();
    expandFirstAddressPanel();
    expect(fixture.nativeElement.textContent).toContain('12.9716');
    expect(fixture.nativeElement.textContent).toContain('MG Road');
    expect(fixture.nativeElement.textContent).toContain('labels.text.No valid saved coordinates');
    expect(L.map).not.toHaveBeenCalled();
  });

  it('releases preview form subscriptions when its dialog closes', () => {
    const opened = new Subject<void>();
    const closed = new Subject<any>();
    const form = formGroupService.createFormGroup(component.getAddressFormFields('add'));
    dialog.open.mockReturnValue({
      afterOpened: () => opened,
      afterClosed: () => closed,
      componentInstance: { form }
    } as any);
    component.addAddress();
    opened.next();
    expect((form.valueChanges as Subject<any>).observed).toBe(true);
    closed.next({});
    expect((form.valueChanges as Subject<any>).observed).toBe(false);
  });
});
