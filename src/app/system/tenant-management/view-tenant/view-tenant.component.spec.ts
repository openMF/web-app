/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap, provideRouter } from '@angular/router';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { DatePipe } from '@angular/common';
import { MatDialog } from '@angular/material/dialog';
import { TranslateModule } from '@ngx-translate/core';
import { FaIconLibrary } from '@fortawesome/angular-fontawesome';
import { faArrowLeft, faEdit, faTrash } from '@fortawesome/free-solid-svg-icons';
import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import { of } from 'rxjs';

import { ViewTenantComponent } from './view-tenant.component';
import { TenantManagementService } from '../tenant-management.service';
import { Tenant, TenantStatus } from '../models/tenant.model';

function tenant(status: TenantStatus | null): Tenant {
  return {
    id: 2,
    identifier: 'acme',
    name: 'Acme Microfinance',
    timezoneId: 'Asia/Kolkata',
    status,
    connection: {
      id: 2,
      schemaName: 'fineract_acme',
      schemaServer: 'db',
      schemaServerPort: '5432',
      schemaUsername: 'postgres',
      autoUpdate: true
    }
  };
}

describe('ViewTenantComponent', () => {
  let component: ViewTenantComponent;
  let fixture: ComponentFixture<ViewTenantComponent>;
  let changeStatus: jest.Mock;
  let deleteTenant: jest.Mock;
  let dialogResult: unknown;

  beforeEach(async () => {
    changeStatus = jest.fn(() => of(tenant('INACTIVE')));
    deleteTenant = jest.fn(() => of({ resourceId: 2 }));
    dialogResult = { confirm: true };

    await TestBed.configureTestingModule({
      imports: [
        ViewTenantComponent,
        TranslateModule.forRoot()
      ],
      providers: [
        provideRouter([]),
        provideNoopAnimations(),
        DatePipe,
        {
          provide: ActivatedRoute,
          useValue: { snapshot: { paramMap: convertToParamMap({ id: '2' }) } }
        },
        {
          provide: MatDialog,
          useValue: { open: () => ({ afterClosed: () => of(dialogResult) }) }
        },
        {
          provide: TenantManagementService,
          useValue: {
            getTenant: () => of(tenant('ACTIVE')),
            changeStatus,
            deleteTenant
          }
        }
      ]
    }).compileComponents();

    TestBed.inject(FaIconLibrary).addIcons(faArrowLeft, faEdit, faTrash);

    fixture = TestBed.createComponent(ViewTenantComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('offers only the commands that would change something', () => {
    expect(component.availableCommands()).toEqual([
      'deactivate',
      'suspend'
    ]);

    component.tenant.set(tenant('SUSPENDED'));
    expect(component.availableCommands()).toEqual([
      'activate',
      'deactivate'
    ]);

    component.tenant.set(tenant('INACTIVE'));
    expect(component.availableCommands()).toEqual([
      'activate',
      'suspend'
    ]);
  });

  it('offers every command when the stored status is unrecognised', () => {
    // Such a tenant is refused until its status is set again, and any command corrects it.
    component.tenant.set(tenant(null));
    expect(component.availableCommands()).toEqual([
      'activate',
      'deactivate',
      'suspend'
    ]);
  });

  it('refuses to remove a tenant that is still active', () => {
    expect(component.canDelete()).toBe(false);

    component.tenant.set(tenant('INACTIVE'));
    expect(component.canDelete()).toBe(true);
  });

  it('sends the chosen command once it is confirmed', () => {
    component.changeStatus('suspend');
    expect(changeStatus).toHaveBeenCalledWith('2', 'suspend');
  });

  it('does nothing when the confirmation is dismissed', () => {
    dialogResult = undefined;

    component.changeStatus('suspend');
    component.delete();

    expect(changeStatus).not.toHaveBeenCalled();
    expect(deleteTenant).not.toHaveBeenCalled();
  });

  it('removes the tenant once the deletion is confirmed', () => {
    dialogResult = { confirm: true };
    component.tenant.set(tenant('INACTIVE'));

    component.delete();

    expect(deleteTenant).toHaveBeenCalledWith('2');
  });
});
