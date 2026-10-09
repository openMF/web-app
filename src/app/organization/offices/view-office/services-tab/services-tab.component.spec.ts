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

import { ServicesTabComponent } from './services-tab.component';
import { AuthenticationService } from 'app/core/authentication/authentication.service';
import { OrganizationService } from 'app/organization/organization.service';

describe('Office ServicesTabComponent', () => {
  let component: ServicesTabComponent;
  let fixture: ComponentFixture<ServicesTabComponent>;
  let organizationService: jest.Mocked<OrganizationService>;
  let dialog: jest.Mocked<MatDialog>;

  const officeService = {
    officeServiceId: 7,
    officeId: 1,
    serviceName: 'Cash Deposit',
    serviceExternalId: 'cash-deposit',
    workingHours: '09:00-17:00'
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
        path: '/fineract-provider/api/v2/offices/1/services'
      }
    };
  }

  beforeEach(async () => {
    jest.clearAllMocks();

    organizationService = {
      getOfficeServices: jest.fn(() => of([officeService])),
      createOfficeService: jest.fn(() => of({ entityId: 10 })),
      updateOfficeService: jest.fn(() => of({ entityId: 7 })),
      deleteOfficeService: jest.fn(() => of({ entityId: 7 }))
    } as unknown as jest.Mocked<OrganizationService>;

    dialog = {
      open: jest.fn()
    } as unknown as jest.Mocked<MatDialog>;

    await TestBed.configureTestingModule({
      imports: [
        ServicesTabComponent,
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
        { provide: MatDialog, useValue: dialog },
        { provide: AuthenticationService, useValue: { getCredentials: () => ({ permissions: [] as string[] }) } },
        provideNoopAnimations()
      ]
    }).compileComponents();

    TestBed.inject(FaIconLibrary).addIcons(faPlus, faEdit, faTrash);
    fixture = TestBed.createComponent(ServicesTabComponent);
    component = fixture.componentInstance;
  });

  it('loads and renders office services', () => {
    fixture.detectChanges();

    expect(organizationService.getOfficeServices).toHaveBeenCalledWith('1');
    expect(component.officeServices).toEqual([officeService]);
    expect(component.isLoading).toBe(false);
    expect(fixture.nativeElement.textContent).toContain('Cash Deposit');
    expect(fixture.nativeElement.textContent).toContain('cash-deposit');
    expect(fixture.nativeElement.textContent).toContain('09:00-17:00');
  });

  it('shows an empty state when the office has no services', () => {
    organizationService.getOfficeServices.mockReturnValue(of([]));

    fixture.detectChanges();

    expect(component.officeServices).toEqual([]);
    expect(fixture.nativeElement.textContent).toContain('No data found');
  });

  it('shows plugin unavailable state when the office services endpoint is not registered', () => {
    organizationService.getOfficeServices.mockReturnValue(throwError(() => endpointNotFoundError()));

    fixture.detectChanges();

    expect(component.isPluginUnavailable).toBe(true);
    expect(component.hasError).toBe(false);
    expect(component.officeServices).toEqual([]);
    expect(fixture.nativeElement.textContent).toContain(
      'labels.text.Office Services management requires the Savings Plugin to be deployed'
    );
  });

  it('shows an error state when office services loading fails for non-404 errors', () => {
    organizationService.getOfficeServices.mockReturnValue(throwError(() => ({ status: 500 })));

    fixture.detectChanges();

    expect(component.hasError).toBe(true);
    expect(component.isPluginUnavailable).toBe(false);
    expect(component.officeServices).toEqual([]);
  });

  it('does not open dialogs or call service endpoints when the plugin is unavailable', () => {
    component.isPluginUnavailable = true;

    component.addService();
    component.editService(officeService);
    component.deleteService(officeService);

    expect(dialog.open).not.toHaveBeenCalled();
    expect(organizationService.createOfficeService).not.toHaveBeenCalled();
    expect(organizationService.updateOfficeService).not.toHaveBeenCalled();
    expect(organizationService.deleteOfficeService).not.toHaveBeenCalled();
  });

  it('creates an office service through the plugin endpoint service method', () => {
    fixture.detectChanges();
    dialog.open.mockReturnValue(
      dialogRefWithValue({
        serviceName: 'ATM',
        serviceExternalId: 'atm',
        workingHours: '24 hours'
      })
    );

    component.addService();

    expect(organizationService.createOfficeService).toHaveBeenCalledWith('1', {
      serviceName: 'ATM',
      serviceExternalId: 'atm',
      workingHours: '24 hours'
    });
  });

  it('updates an existing office service by office service id', () => {
    fixture.detectChanges();
    dialog.open.mockReturnValue(
      dialogRefWithValue({
        serviceName: 'Updated Cash Deposit',
        serviceExternalId: 'updated-cash-deposit',
        workingHours: '10:00-16:00'
      })
    );

    component.editService(officeService);

    expect(organizationService.updateOfficeService).toHaveBeenCalledWith('1', '7', {
      serviceName: 'Updated Cash Deposit',
      serviceExternalId: 'updated-cash-deposit',
      workingHours: '10:00-16:00'
    });
  });

  it('deletes an existing office service by office service id', () => {
    fixture.detectChanges();
    dialog.open.mockReturnValue(dialogRefWithDelete());

    component.deleteService(officeService);

    expect(organizationService.deleteOfficeService).toHaveBeenCalledWith('1', '7');
  });

  it('handles office services without ids without throwing', () => {
    const serviceWithoutId: any = {
      ...officeService,
      officeServiceId: undefined,
      id: undefined,
      serviceId: undefined
    };

    fixture.detectChanges();
    dialog.open.mockClear();

    expect(component.getOfficeServiceId(serviceWithoutId)).toBe('');
    expect(component.getOfficeServiceId(serviceWithoutId, 3)).toBe('office-service-3');
    expect(() => component.editService(serviceWithoutId)).not.toThrow();
    expect(() => component.deleteService(serviceWithoutId)).not.toThrow();
    expect(dialog.open).not.toHaveBeenCalled();
    expect(organizationService.updateOfficeService).not.toHaveBeenCalled();
    expect(organizationService.deleteOfficeService).not.toHaveBeenCalled();
  });

  it('shows plugin unavailable state when create returns endpoint not found', () => {
    fixture.detectChanges();
    organizationService.createOfficeService.mockReturnValue(throwError(() => endpointNotFoundError()));
    dialog.open.mockReturnValue(
      dialogRefWithValue({
        serviceName: 'ATM',
        serviceExternalId: 'atm',
        workingHours: '24 hours'
      })
    );

    component.addService();

    expect(component.isPluginUnavailable).toBe(true);
    expect(component.hasError).toBe(false);
    expect(component.officeServices).toEqual([]);
  });
});
