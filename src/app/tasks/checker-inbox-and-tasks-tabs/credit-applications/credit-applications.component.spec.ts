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
import { LoansService } from 'app/loans/loans.service';
import { OrganizationService } from 'app/organization/organization.service';
import { Dates } from 'app/core/utils/dates';
import { TasksService } from '../../tasks.service';
import { CreditApplicationsComponent } from './credit-applications.component';

describe('CreditApplicationsComponent', () => {
  let component: CreditApplicationsComponent;
  let fixture: ComponentFixture<CreditApplicationsComponent>;
  let tasksService: jest.Mocked<TasksService>;
  let loansService: jest.Mocked<LoansService>;
  let clientsService: jest.Mocked<ClientsService>;
  let organizationService: jest.Mocked<OrganizationService>;
  let routerNavigate: jest.SpyInstance;

  const page = {
    totalFilteredRecords: 1,
    pageItems: [
      {
        loanId: 42,
        accountNo: 'LN-42',
        clientName: 'Alex Client',
        clientTypeId: 3,
        productName: 'Working Capital',
        amount: 1200,
        currencyCode: 'USD',
        submittedOnDate: [
          2026,
          1,
          15
        ],
        stateProvinceId: 7,
        municipality: 'Austin',
        status: 'submitted'
      }
    ]
  };

  function createComponent(creditApplicationsResponse = of(page)) {
    tasksService = {
      getCreditApplications: jest.fn(() => creditApplicationsResponse)
    } as any;
    loansService = {
      getLoanProducts: jest.fn(() => of([{ id: 9, name: 'Working Capital' }]))
    } as any;
    clientsService = {
      getClientTemplate: jest.fn(() => of({ clientTypeOptions: [{ id: 3, name: 'Business' }] })),
      getClientAddressTemplate: jest.fn(() => of({ stateProvinceIdOptions: [{ id: 7, name: 'Texas' }] }))
    } as any;
    organizationService = {
      getCurrencies: jest.fn(() => of({ selectedCurrencyOptions: [{ code: 'USD', name: 'US Dollar' }] }))
    } as any;

    TestBed.configureTestingModule({
      imports: [
        CreditApplicationsComponent,
        TranslateModule.forRoot(),
        NoopAnimationsModule
      ],
      providers: [
        DatePipe,
        {
          provide: Dates,
          useValue: {
            formatDate: (date: Date) =>
              `${date.getFullYear()}-${`${date.getMonth() + 1}`.padStart(2, '0')}-${`${date.getDate()}`.padStart(2, '0')}`,
            isAfter: (date1: Date, date2: Date) => date1.getTime() > date2.getTime()
          }
        },
        { provide: TasksService, useValue: tasksService },
        { provide: LoansService, useValue: loansService },
        { provide: ClientsService, useValue: clientsService },
        { provide: OrganizationService, useValue: organizationService },
        provideNativeDateAdapter(),
        provideRouter([])
      ]
    });

    fixture = TestBed.createComponent(CreditApplicationsComponent);
    component = fixture.componentInstance;
    routerNavigate = jest.spyOn((component as any).router, 'navigate');
    fixture.detectChanges();
  }

  beforeEach(() => {
    createComponent();
    tasksService.getCreditApplications.mockClear();
  });

  it('loads filter options without requesting the loan creation template', () => {
    expect(loansService.getLoanProducts).toHaveBeenCalled();
    expect(clientsService.getClientTemplate).toHaveBeenCalled();
    expect(clientsService.getClientAddressTemplate).toHaveBeenCalled();
    expect(organizationService.getCurrencies).toHaveBeenCalled();
    expect((tasksService as any).getLoanApplicationSearchTemplate).toBeUndefined();
    expect(component.loanProductOptions).toEqual([{ id: 9, name: 'Working Capital' }]);
    expect(component.statusOptions).toContainEqual(
      expect.objectContaining({ id: 100, labelKey: 'labels.inputs.Submitted and pending approval' })
    );
  });

  it('applies filters and resets the current page', () => {
    component.pageIndex = 2;
    component.creditApplicationsForm.patchValue({
      submittedFrom: new Date(2026, 0, 1),
      submittedTo: new Date(2026, 0, 31),
      clientTypeId: 3,
      stateProvinceId: 7,
      municipality: 'Austin',
      productId: 9,
      status: 100
    });

    component.applyFilters();

    expect(component.pageIndex).toBe(0);
    expect(tasksService.getCreditApplications).toHaveBeenCalledWith(
      expect.objectContaining({
        submittedFrom: '2026-01-01',
        submittedTo: '2026-01-31',
        clientTypeId: 3,
        stateProvinceId: 7,
        municipality: 'Austin',
        productId: 9,
        status: 100,
        offset: 0,
        limit: 10
      })
    );
  });

  it('clears filters and reloads the first page', () => {
    component.pageIndex = 3;
    component.filterError = 'labels.text.Amounts cannot be negative';
    component.creditApplicationsForm.patchValue({ minAmount: 10, currencyCode: 'USD' });

    component.clearFilters();

    expect(component.filterError).toBe('');
    expect(component.pageIndex).toBe(0);
    expect(component.creditApplicationsForm.value.minAmount).toBeNull();
    expect(tasksService.getCreditApplications).toHaveBeenCalledWith(expect.objectContaining({ offset: 0, limit: 10 }));
  });

  it('blocks invalid date ranges', () => {
    component.creditApplicationsForm.patchValue({
      submittedFrom: new Date(2026, 0, 31),
      submittedTo: new Date(2026, 0, 1)
    });

    component.applyFilters();

    expect(component.filterError).toBe('labels.text.From Date cannot be after To Date');
    expect(tasksService.getCreditApplications).not.toHaveBeenCalled();
  });

  it('blocks invalid amount ranges', () => {
    component.creditApplicationsForm.patchValue({ minAmount: 200, maxAmount: 100, currencyCode: 'USD' });

    component.applyFilters();

    expect(component.filterError).toBe('labels.text.Minimum Amount cannot be greater than Maximum Amount');
    expect(tasksService.getCreditApplications).not.toHaveBeenCalled();
  });

  it('requires currency when filtering by amount', () => {
    component.creditApplicationsForm.patchValue({ minAmount: 100 });

    component.applyFilters();

    expect(component.filterError).toBe('labels.text.Currency is required when filtering by amount');
    expect(tasksService.getCreditApplications).not.toHaveBeenCalled();
  });

  it('uses paginator offset and limit and resets paging on a new search', () => {
    component.changePaging({ pageIndex: 2, pageSize: 25 } as any);

    expect(tasksService.getCreditApplications).toHaveBeenLastCalledWith(
      expect.objectContaining({ offset: 50, limit: 25 })
    );

    component.applyFilters();

    expect(tasksService.getCreditApplications).toHaveBeenLastCalledWith(
      expect.objectContaining({ offset: 0, limit: 25 })
    );
  });

  it('resets paging without emitting a duplicate paginator request', () => {
    component.pageIndex = 2;
    component.paginator = { pageIndex: 2, firstPage: jest.fn() } as any;

    component.applyFilters();

    expect(component.paginator.pageIndex).toBe(0);
    expect(component.paginator.firstPage).not.toHaveBeenCalled();
    expect(tasksService.getCreditApplications).toHaveBeenCalledTimes(1);
  });

  it('requests the server again when sorting changes', () => {
    component.sortData({ active: 'amount', direction: 'asc' });

    expect(component.pageIndex).toBe(0);
    expect(tasksService.getCreditApplications).toHaveBeenCalledWith(
      expect.objectContaining({
        orderBy: 'amount',
        sortOrder: 'ASC',
        offset: 0
      })
    );
  });

  it('resets to the default server sort when sorting is cleared', () => {
    component.sortData({ active: 'amount', direction: '' });

    expect(tasksService.getCreditApplications).toHaveBeenCalledWith(
      expect.objectContaining({
        orderBy: 'submittedOnDate',
        sortOrder: 'DESC',
        offset: 0
      })
    );
  });

  it('tracks loading and renders empty state after an empty response', () => {
    const response = new Subject<any>();
    TestBed.resetTestingModule();
    createComponent(response.asObservable());

    expect(component.loading).toBe(true);
    expect(fixture.nativeElement.textContent).toContain('labels.text.Loading credit applications');

    response.next({ totalFilteredRecords: 0, pageItems: [] });
    response.complete();
    fixture.detectChanges();

    expect(component.loading).toBe(false);
    expect(component.dataSource.data).toEqual([]);
    expect(component.totalFilteredRecords).toBe(0);
    expect(fixture.nativeElement.textContent).toContain('labels.text.No credit applications found');
  });

  it('shows an error state when loading fails', () => {
    TestBed.resetTestingModule();
    createComponent(throwError(() => new Error('network')));

    expect(component.loading).toBe(false);
    expect(component.dataSource.data).toEqual([]);
    expect(component.filterError).toBe('labels.text.Unable to load credit applications');
  });

  it('navigates rows to the existing loan details route', () => {
    component.viewCreditApplication({ loanId: 42 });

    expect(routerNavigate).toHaveBeenCalledWith([
      '/loans',
      42,
      'general'
    ]);
  });
});
