/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { By } from '@angular/platform-browser';
import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideRouter, Router, RouterLink } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { TranslateModule } from '@ngx-translate/core';
import { FaIconLibrary } from '@fortawesome/angular-fontawesome';
import {
  faBuilding,
  faCalendar,
  faEdit,
  faLocationArrow,
  faPlus,
  faTrash,
  faExchange
} from '@fortawesome/free-solid-svg-icons';
import { beforeEach, afterEach, describe, expect, it, jest } from '@jest/globals';
import { AuthenticationService } from 'app/core/authentication/authentication.service';
import { environment } from 'environments/environment';
import { of, Subject } from 'rxjs';
import { MatDialog } from '@angular/material/dialog';
import { OrganizationService } from 'app/organization/organization.service';
import { ClientsService } from 'app/clients/clients.service';
import { PostalCodeLookupService } from 'app/shared/services/postal-code-lookup.service';
import { AddressTabComponent } from './address-tab/address-tab.component';
import { ServicesTabComponent } from './services-tab/services-tab.component';
import { ViewOfficeComponent } from './view-office.component';

@Component({ template: '' })
class EmptyTabComponent {}

describe('Branch details header', () => {
  let office: any;
  let api: any;
  let dialog: any;
  let permissions: string[];
  const rbac = environment.productionModeEnableRBAC;

  beforeEach(async () => {
    environment.productionModeEnableRBAC = true;
    permissions = [
      'READ_OFFICE',
      'UPDATE_OFFICE',
      'READ_Branch data'
    ];
    office = { id: 4, name: 'Saved branch name', externalId: '00012345678901234567890' };
    api = {
      getOfficeAddresses: jest.fn(() => of([])),
      getOfficeServices: jest.fn(() => of([])),
      updateOfficeService: jest.fn(() => of({})),
      updateOfficeAddress: jest.fn(() => of({}))
    };
    dialog = { open: jest.fn() };
    await TestBed.configureTestingModule({
      imports: [
        ViewOfficeComponent,
        TranslateModule.forRoot()
      ],
      providers: [
        provideRouter([
          {
            path: 'organization/offices/:officeId',
            component: ViewOfficeComponent,
            resolve: { office: () => office, officeDatatables: () => [{ registeredTableName: 'Branch data' }] },
            children: [
              { path: 'general', component: EmptyTabComponent },
              { path: 'address', component: AddressTabComponent },
              { path: 'services', component: ServicesTabComponent }
            ]
          }
        ]),
        provideNoopAnimations(),
        { provide: OrganizationService, useValue: api },
        { provide: ClientsService, useValue: { getClientAddressTemplate: () => of({}) } },
        { provide: PostalCodeLookupService, useValue: { enabled: false } },
        { provide: MatDialog, useValue: dialog },
        { provide: AuthenticationService, useValue: { getCredentials: () => ({ permissions }) } }
      ]
    }).compileComponents();
    TestBed.inject(FaIconLibrary).addIcons(
      faBuilding,
      faCalendar,
      faEdit,
      faLocationArrow,
      faPlus,
      faTrash,
      faExchange
    );
  });

  afterEach(() => {
    environment.productionModeEnableRBAC = rbac;
  });

  it('renders resolved identifiers intact and keeps existing route and datatable links', async () => {
    const harness = await RouterTestingHarness.create('/organization/offices/4/general');
    const text = harness.routeNativeElement.textContent;
    expect(text).toContain('Saved branch name');
    expect(text).toContain('00012345678901234567890');
    const hrefs = harness.routeDebugElement
      .queryAll(By.directive(RouterLink))
      .map((link) => link.injector.get(RouterLink).urlTree.toString());
    for (const path of [
      'general',
      'address',
      'services',
      'schedules',
      'datatables/Branch%20data'
    ]) {
      expect(hrefs).toContain('/organization/offices/4/' + path);
    }
  });

  it('requires verified hierarchy data for a head-office badge', async () => {
    const harness = await RouterTestingHarness.create('/organization/offices/4/general');
    expect(harness.routeNativeElement.querySelector('.hierarchy-badge')).toBeNull();
    office = { id: 9, name: 'Office', hierarchy: '.' };
    await TestBed.inject(Router).navigateByUrl('/organization/offices/9/general');
    harness.detectChanges();
    expect(harness.routeNativeElement.querySelector('.hierarchy-badge')).not.toBeNull();
    office = { id: 10, name: 'Office', hierarchy: '.1.10.', parentId: 1 };
    await TestBed.inject(Router).navigateByUrl('/organization/offices/10/general');
    harness.detectChanges();
    expect(harness.routeNativeElement.querySelector('.hierarchy-badge')).toBeNull();
  });

  it('hides edit and protected tabs for a restricted user', async () => {
    permissions = [];
    const harness = await RouterTestingHarness.create('/organization/offices/4/general');
    expect(harness.routeNativeElement.querySelector('.office-actions button')).toBeNull();
    expect(harness.routeNativeElement.querySelectorAll('a[mat-tab-link]')).toHaveLength(1);
  });

  it('uses loaded counts and location, clearing them when the selected office changes', async () => {
    const harness = await RouterTestingHarness.create('/organization/offices/4/general');
    const component = harness.routeDebugElement.componentInstance as ViewOfficeComponent;
    component.summary.addressCount.set(0);
    component.summary.serviceCount.set(2);
    component.summary.location.set('Saved city');
    harness.detectChanges();
    expect(
      Array.from(harness.routeNativeElement.querySelectorAll('.tab-count')).map((e: any) => e.textContent.trim())
    ).toEqual([
      '0',
      '2'
    ]);
    expect(harness.routeNativeElement.textContent).toContain('Saved city');
    office = { id: 9, name: 'Another office' };
    await TestBed.inject(Router).navigateByUrl('/organization/offices/9/general');
    harness.detectChanges();
    expect(harness.routeNativeElement.querySelectorAll('.tab-count')).toHaveLength(0);
    expect(harness.routeNativeElement.textContent).not.toContain('Saved city');
  });
  it.each([
    'address',
    'services'
  ])('reloads the real %s tab on office changes and ignores late responses', async (tab) => {
    const previous = new Subject<any[]>();
    const current = new Subject<any[]>();
    const method = tab === 'address' ? api.getOfficeAddresses : api.getOfficeServices;
    method.mockReturnValueOnce(previous).mockReturnValueOnce(current);
    const harness = await RouterTestingHarness.create(`/organization/offices/4/${tab}`);
    const type = tab === 'address' ? AddressTabComponent : ServicesTabComponent;
    const before = harness.routeDebugElement.query(By.directive(type)).componentInstance;
    expect(method).toHaveBeenCalledWith('4');
    expect(previous.observed).toBe(true);

    office = { id: 9, name: 'New office' };
    await TestBed.inject(Router).navigateByUrl(`/organization/offices/9/${tab}`);
    harness.detectChanges();
    const after = harness.routeDebugElement.query(By.directive(type)).componentInstance;
    expect(after).toBe(before);
    expect(after.officeId).toBe('9');
    expect(previous.observed).toBe(false);
    expect(method).toHaveBeenCalledWith('9');
    const record =
      tab === 'address'
        ? { officeAddressId: 21, street: 'New office address', isActive: true }
        : { officeServiceId: 21, serviceName: 'New office service' };
    current.next([record]);
    current.complete();
    previous.next([{ id: 1, street: 'Stale address', serviceName: 'Stale service' }]);
    previous.complete();
    harness.detectChanges();
    expect(tab === 'address' ? after.officeAddresses : after.officeServices).toEqual([record]);
    expect(harness.routeNativeElement.textContent).not.toContain('Stale');

    const closed = new Subject<any>();
    dialog.open.mockReturnValue({ afterClosed: () => closed, afterOpened: () => of() });
    if (tab === 'address') after.editAddress(record);
    else after.editService(record);
    office = { id: 10, name: 'Next office' };
    await TestBed.inject(Router).navigateByUrl(`/organization/offices/10/${tab}`);
    closed.next({ data: { value: {} } });
    expect(api.updateOfficeAddress).not.toHaveBeenCalled();
    expect(api.updateOfficeService).not.toHaveBeenCalled();
  });
});
