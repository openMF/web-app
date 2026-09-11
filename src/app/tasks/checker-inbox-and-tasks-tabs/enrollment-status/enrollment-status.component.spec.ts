/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { DatePipe } from '@angular/common';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideNativeDateAdapter } from '@angular/material/core';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { provideRouter } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { of, Subject, throwError } from 'rxjs';

import { ClientsService } from 'app/clients/clients.service';
import { EnrollmentCase, TasksService } from '../../tasks.service';
import { EnrollmentStatusComponent } from './enrollment-status.component';

describe('EnrollmentStatusComponent', () => {
  let component: EnrollmentStatusComponent;
  let fixture: ComponentFixture<EnrollmentStatusComponent>;
  let tasksService: jest.Mocked<TasksService>;
  let clientsService: jest.Mocked<ClientsService>;
  let routerNavigate: jest.SpyInstance;

  const page: { totalFilteredRecords: number; pageItems: EnrollmentCase[] } = {
    totalFilteredRecords: 1,
    pageItems: [
      {
        clientId: 42,
        clientName: 'Alex Client',
        officeId: 1,
        clientLifecycleStatus: 'PENDING',
        enrollmentStages: [
          { name: 'COMMERCIAL_REGISTRATION', status: 'COMPLETED', aging: { days: 2, trafficLight: 'Yellow' } },
          { name: 'KYC_LEVEL_1', status: 'PENDING', aging: null },
          { name: 'KYC_LEVEL_2', status: 'UNKNOWN', aging: null },
          { name: 'KYC_LEVEL_3', status: 'REJECTED', aging: null },
          { name: 'COMPLIANCE', status: 'WITHDRAWN', aging: null },
          { name: 'ACTIVATION', status: 'CLOSED', aging: null }
        ],
        kycEvidence: {
          providerDecisionStatus: 'PROVIDER_REVIEW',
          derivedKycStatus: 'DERIVED_PENDING',
          faceMatchStatus: 'MATCHED',
          idVerificationStatus: 'VERIFIED',
          amlScreeningStatus: 'CLEAR'
        }
      }
    ]
  };

  function createComponent(enrollmentResponse = of(page)) {
    tasksService = {
      getEnrollmentCases: jest.fn(() => enrollmentResponse)
    } as any;
    clientsService = {
      getFilteredClients: jest.fn(() => of({ pageItems: [{ id: 42, displayName: 'Alex Client' }] }))
    } as any;

    TestBed.configureTestingModule({
      imports: [
        EnrollmentStatusComponent,
        TranslateModule.forRoot(),
        NoopAnimationsModule
      ],
      providers: [
        DatePipe,
        { provide: TasksService, useValue: tasksService },
        { provide: ClientsService, useValue: clientsService },
        provideNativeDateAdapter(),
        provideRouter([])
      ]
    });

    fixture = TestBed.createComponent(EnrollmentStatusComponent);
    component = fixture.componentInstance;
    routerNavigate = jest.spyOn((component as any).router, 'navigate');
    fixture.detectChanges();
  }

  beforeEach(() => {
    createComponent();
    tasksService.getEnrollmentCases.mockClear();
  });

  it('renders successful enrollment statuses', () => {
    expect(component.dataSource.data).toEqual(page.pageItems);
    expect(fixture.nativeElement.textContent).toContain('Alex Client');
    expect(fixture.nativeElement.textContent).toContain('COMPLETED');
    expect(fixture.nativeElement.textContent).toContain('PENDING');
    expect(fixture.nativeElement.textContent).toContain('REJECTED');
  });

  it('renders UNKNOWN as its own neutral status', () => {
    const status = component.stageStatus(page.pageItems[0], 'kycLevel2');

    expect(status).toBe('UNKNOWN');
    expect(component.displayStatus(status)).toBe('UNKNOWN');
    expect(component.statusClass(status)).toBe('status-unknown');
  });

  it('shows null aging as unavailable without calculating it', () => {
    const enrollmentCase: EnrollmentCase = {
      ...page.pageItems[0],
      enrollmentStages: [{ name: 'KYC_LEVEL_1', status: 'PENDING', aging: null }]
    };

    expect(component.agingLabel(enrollmentCase)).toBe('-');
    expect(component.agingClass(enrollmentCase)).toBe('aging-neutral');
  });

  it('uses the same enrollment stage aging record for label and class', () => {
    const enrollmentCase: EnrollmentCase = {
      ...page.pageItems[0],
      enrollmentStages: [
        { name: 'COMMERCIAL_REGISTRATION', status: 'PENDING', aging: { days: 2 } },
        { name: 'KYC_LEVEL_1', status: 'PENDING', aging: { days: 8, trafficLight: 'Orange' } }
      ]
    };

    expect(component.agingLabel(enrollmentCase)).toBe('8 Orange');
    expect(component.agingClass(enrollmentCase)).toBe('aging-orange');
  });

  it('keeps provider and derived KYC statuses distinct in details', () => {
    component.toggleDetails(page.pageItems[0]);
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('PROVIDER_REVIEW');
    expect(fixture.nativeElement.textContent).toContain('DERIVED_PENDING');
  });

  it('uses backend pagination parameters', () => {
    component.changePaging({ pageIndex: 2, pageSize: 25 } as any);

    expect(tasksService.getEnrollmentCases).toHaveBeenLastCalledWith({
      view: 'enrollment',
      clientId: undefined,
      offset: 50,
      limit: 25
    });
  });

  it('shows empty state only after loading completes', () => {
    const response = new Subject<any>();
    TestBed.resetTestingModule();
    createComponent(response.asObservable());

    expect(component.loading).toBe(true);
    expect(fixture.nativeElement.textContent).toContain('labels.text.Loading enrollment status');
    expect(fixture.nativeElement.textContent).not.toContain('labels.text.No enrollment cases found');

    response.next({ totalFilteredRecords: 0, pageItems: [] });
    response.complete();
    fixture.detectChanges();

    expect(component.loading).toBe(false);
    expect(fixture.nativeElement.textContent).toContain('labels.text.No enrollment cases found');
  });

  it('shows backend error state', () => {
    TestBed.resetTestingModule();
    createComponent(throwError(() => new Error('network')));

    expect(component.loading).toBe(false);
    expect(component.dataSource.data).toEqual([]);
    expect(component.loadError).toBe('labels.text.Unable to load enrollment status');
  });

  it('does not clear the selected filter or load all cases for unresolved typed client text', () => {
    component.selectedClientId = 42;
    component.clientControl.setValue('Alex', { emitEvent: false });

    component.applyClientFilter();
    fixture.detectChanges();

    expect(component.selectedClientId).toBe(42);
    expect(component.clientFilterError).toBe('labels.text.Select a client from the list');
    expect(component.clientControl.hasError('clientSelectionRequired')).toBe(true);
    expect(tasksService.getEnrollmentCases).not.toHaveBeenCalled();
    expect(fixture.nativeElement.textContent).toContain('labels.text.Select a client from the list');
  });

  it('navigates to the existing client details route', () => {
    component.viewClient(page.pageItems[0]);

    expect(routerNavigate).toHaveBeenCalledWith([
      '/clients',
      42,
      'general'
    ]);
  });

  it('resets the paginator when selecting a client without duplicate requests', () => {
    component.pageIndex = 2;
    component.paginator = { pageIndex: 2, firstPage: jest.fn() } as any;

    component.selectClient({ id: 42, displayName: 'Alex Client' });

    expect(component.pageIndex).toBe(0);
    expect(component.paginator.pageIndex).toBe(0);
    expect(component.paginator.firstPage).not.toHaveBeenCalled();
    expect(tasksService.getEnrollmentCases).toHaveBeenCalledTimes(1);
    expect(tasksService.getEnrollmentCases).toHaveBeenCalledWith({
      view: 'enrollment',
      clientId: 42,
      offset: 0,
      limit: 10
    });
  });

  it('keeps the latest enrollment load when requests finish out of order', () => {
    const olderResponse = new Subject<{ totalFilteredRecords: number; pageItems: EnrollmentCase[] }>();
    const latestResponse = new Subject<{ totalFilteredRecords: number; pageItems: EnrollmentCase[] }>();
    tasksService.getEnrollmentCases
      .mockReturnValueOnce(olderResponse.asObservable())
      .mockReturnValueOnce(latestResponse.asObservable());

    component.changePaging({ pageIndex: 1, pageSize: 10 } as any);
    component.changePaging({ pageIndex: 2, pageSize: 10 } as any);

    latestResponse.next({
      totalFilteredRecords: 1,
      pageItems: [{ clientId: 2, clientName: 'Latest Client' }]
    });
    latestResponse.complete();
    olderResponse.next({
      totalFilteredRecords: 1,
      pageItems: [{ clientId: 1, clientName: 'Stale Client' }]
    });
    olderResponse.complete();
    fixture.detectChanges();

    expect(component.dataSource.data).toEqual([{ clientId: 2, clientName: 'Latest Client' }]);
    expect(fixture.nativeElement.textContent).toContain('Latest Client');
    expect(fixture.nativeElement.textContent).not.toContain('Stale Client');
  });
});
