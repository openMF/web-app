/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { DatePipe } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { FaIconLibrary } from '@fortawesome/angular-fontawesome';
import { faPlus, faSearch } from '@fortawesome/free-solid-svg-icons';
import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import { of } from 'rxjs';

import { SettingsService } from 'app/settings/settings.service';
import { TenantsComponent } from './tenants.component';
import { TenantManagementService } from './tenant-management.service';
import { Tenant, TenantsPage } from './models/tenant.model';

function tenant(id: number, identifier: string, name: string): Tenant {
  return {
    id,
    identifier,
    name,
    timezoneId: 'Asia/Kolkata',
    status: 'ACTIVE',
    createdDate: '2026-09-14T10:15:30Z',
    connection: {
      id,
      schemaName: `mifostenant_${identifier}`,
      schemaServer: 'localhost',
      schemaServerPort: '5432',
      schemaUsername: 'fineract',
      autoUpdate: true
    }
  };
}

describe('TenantsComponent', () => {
  let component: TenantsComponent;
  let fixture: ComponentFixture<TenantsComponent>;
  let page: TenantsPage;
  let setDiscoveredTenantIdentifiers: jest.Mock;

  beforeEach(async () => {
    page = {
      pageItems: [
        tenant(1, 'acme', 'Acme Microfinance'),
        tenant(2, 'beta', 'Beta Cooperative')
      ],
      totalFilteredRecords: 2
    };
    setDiscoveredTenantIdentifiers = jest.fn();

    await TestBed.configureTestingModule({
      imports: [
        TenantsComponent,
        TranslateModule.forRoot()
      ],
      providers: [
        provideRouter([]),
        provideNoopAnimations(),
        // The impure dateFormat pipe reaches Dates, which injects DatePipe.
        DatePipe,
        {
          provide: TenantManagementService,
          useValue: {
            getTenants: () => of(page),
            getTemplate: () =>
              of({
                timezones: ['Asia/Kolkata'],
                statuses: [
                  'ACTIVE',
                  'INACTIVE',
                  'SUSPENDED'
                ]
              })
          }
        },
        {
          provide: SettingsService,
          useValue: { setDiscoveredTenantIdentifiers, dateFormat: 'dd MMMM yyyy', language: { code: 'en-US' } }
        }
      ]
    }).compileComponents();

    TestBed.inject(FaIconLibrary).addIcons(faSearch, faPlus);

    fixture = TestBed.createComponent(TenantsComponent);
    component = fixture.componentInstance;
  });

  it('lists the tenants returned by the API', () => {
    fixture.detectChanges();

    const textContent = fixture.nativeElement.textContent;
    expect(textContent).toContain('acme');
    expect(textContent).toContain('Acme Microfinance');
    expect(textContent).toContain('beta');
  });

  it('offers the statuses the backend reported rather than a hardcoded list', () => {
    fixture.detectChanges();

    expect(component.statuses()).toEqual([
      'ACTIVE',
      'INACTIVE',
      'SUSPENDED'
    ]);
  });

  it('remembers the identifiers for the login tenant selector', () => {
    fixture.detectChanges();

    expect(setDiscoveredTenantIdentifiers).toHaveBeenCalledWith([
      'acme',
      'beta'
    ]);
  });

  it('does not remember identifiers from a filtered list', () => {
    fixture.detectChanges();
    setDiscoveredTenantIdentifiers.mockClear();

    component.searchControl.setValue('ac');
    component.loadTenants();

    expect(setDiscoveredTenantIdentifiers).not.toHaveBeenCalled();
  });

  it('does not remember identifiers from one page of a longer list', () => {
    page.totalFilteredRecords = 42;
    fixture.detectChanges();

    expect(setDiscoveredTenantIdentifiers).not.toHaveBeenCalled();
  });
});
