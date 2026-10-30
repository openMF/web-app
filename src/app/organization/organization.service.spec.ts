/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { OrganizationService } from './organization.service';
import { SettingsService } from 'app/settings/settings.service';

describe('Office extension API contracts', () => {
  let service: OrganizationService;
  let http: HttpTestingController;
  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: SettingsService, useValue: {} }
      ] });
    service = TestBed.inject(OrganizationService);
    http = TestBed.inject(HttpTestingController);
  });
  afterEach(() => http.verify());
  it('creates and rereads the saved office address using the plugin API', () => {
    const address = { addressTypeId: 1, street: 'Persistence test', latitude: 0, longitude: 0 };
    service.createOfficeAddress('2', address).subscribe();
    const create = http.expectOne('/v2/offices/2/addresses');
    expect(create.request.method).toBe('POST');
    expect(create.request.body).toEqual(address);
    create.flush({ entityId: 7 });
    service
      .getOfficeAddresses('2')
      .subscribe((addresses) => expect(addresses).toEqual([{ ...address, officeAddressId: 7 }]));
    const read = http.expectOne('/v2/offices/2/addresses');
    expect(read.request.method).toBe('GET');
    read.flush([{ ...address, officeAddressId: 7 }]);
  });
  it('uses real services and schedules resources', () => {
    service.getOfficeServices('2').subscribe();
    http.expectOne('/v2/offices/2/services').flush([]);
    service.getOfficeSchedules('2').subscribe();
    http.expectOne('/v2/offices/2/schedules').flush({ officeId: 2, days: [] });
  });
  it('propagates access errors instead of substituting sample data', () => {
    service.getOfficeAddresses('2').subscribe({ error: (error) => expect(error.status).toBe(403) });
    http.expectOne('/v2/offices/2/addresses').flush({}, { status: 403, statusText: 'Forbidden' });
  });
});
