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
import { MatDialog } from '@angular/material/dialog';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { provideRouter } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { of, Subject, throwError } from 'rxjs';

import { ClientsService } from 'app/clients/clients.service';
import { AuthenticationService } from 'app/core/authentication/authentication.service';
import { LoansService } from 'app/loans/loans.service';
import { OrganizationService } from 'app/organization/organization.service';
import { Dates } from 'app/core/utils/dates';
import { ProductsService } from 'app/products/products.service';
import { SettingsService } from 'app/settings/settings.service';
import { environment } from 'environments/environment';
import { TasksService } from '../../tasks.service';
import { CreditApplicationsComponent } from './credit-applications.component';

describe('CreditApplicationsComponent', () => {
  let component: CreditApplicationsComponent;
  let fixture: ComponentFixture<CreditApplicationsComponent>;
  let tasksService: jest.Mocked<TasksService>;
  let loansService: jest.Mocked<LoansService>;
  let clientsService: jest.Mocked<ClientsService>;
  let organizationService: jest.Mocked<OrganizationService>;
  let productsService: jest.Mocked<ProductsService>;
  let dialog: jest.Mocked<MatDialog>;
  let authenticationService: jest.Mocked<AuthenticationService>;
  let routerNavigate: jest.SpyInstance;
  const rbacEnabled = environment.productionModeEnableRBAC;

  const page = {
    totalFilteredRecords: 1,
    pageItems: [
      {
        loanId: 42,
        accountNo: 'LN-42',
        clientName: 'Alex Client',
        clientTypeId: 3,
        productId: 10,
        productName: 'Term Loan',
        productType: 'loan',
        amount: 1200,
        currencyCode: 'USD',
        submittedOnDate: [
          2026,
          1,
          15
        ],
        stateProvinceId: 7,
        municipality: 'Austin',
        status: {
          id: 100,
          code: 'loanStatusType.submitted.and.pending.approval',
          value: 'Submitted and pending approval'
        }
      }
    ]
  };

  function createComponent(creditApplicationsResponse = of(page), permissions: string[] = ['REJECT_LOAN']) {
    tasksService = {
      getCreditApplications: jest.fn(() => creditApplicationsResponse)
    } as any;
    loansService = {
      loanActionButtons: jest.fn(() => of({ resourceId: 42 })),
      applyWorkingCapitalLoanAccountCommand: jest.fn(() => of({ resourceId: 42 }))
    } as any;
    productsService = {
      getLoanProductsBasicDetails: jest.fn(() =>
        of([
          { id: 9, name: 'Working Capital', productType: 'working-capital' },
          { id: 10, name: 'Term Loan', productType: 'loan' }
        ])
      )
    } as any;
    clientsService = {
      getClientTemplate: jest.fn(() => of({ clientTypeOptions: [{ id: 3, name: 'Business' }] })),
      getClientAddressTemplate: jest.fn(() => of({ stateProvinceIdOptions: [{ id: 7, name: 'Texas' }] }))
    } as any;
    organizationService = {
      getCurrencies: jest.fn(() => of({ selectedCurrencyOptions: [{ code: 'USD', name: 'US Dollar' }] }))
    } as any;
    dialog = {
      open: jest.fn(() => ({
        afterClosed: () =>
          of({
            confirm: true,
            data: {
              rejectedOnDate: new Date(2026, 8, 1),
              note: 'Policy declined'
            }
          })
      }))
    } as any;
    authenticationService = {
      getCredentials: jest.fn(() => ({ permissions }))
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
        { provide: ProductsService, useValue: productsService },
        { provide: MatDialog, useValue: dialog },
        {
          provide: SettingsService,
          useValue: { businessDate: new Date(2026, 8, 8), dateFormat: 'dd MMMM yyyy', language: { code: 'en' } }
        },
        { provide: AuthenticationService, useValue: authenticationService },
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
    environment.productionModeEnableRBAC = false;
    createComponent();
    tasksService.getCreditApplications.mockClear();
  });

  afterEach(() => {
    environment.productionModeEnableRBAC = rbacEnabled;
  });

  it('loads filter options without requesting the loan creation template', () => {
    expect(productsService.getLoanProductsBasicDetails).toHaveBeenCalled();
    expect(clientsService.getClientTemplate).toHaveBeenCalled();
    expect(clientsService.getClientAddressTemplate).toHaveBeenCalled();
    expect(organizationService.getCurrencies).toHaveBeenCalled();
    expect((tasksService as any).getLoanApplicationSearchTemplate).toBeUndefined();
    expect(component.loanProductOptions).toEqual([
      { id: 9, name: 'Working Capital', productType: 'working-capital' },
      { id: 10, name: 'Term Loan', productType: 'loan' }
    ]);
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

  it('selects and deselects rejectable rows only', () => {
    const rejectable = page.pageItems[0];
    const approved = { ...rejectable, loanId: 43, status: { id: 200, value: 'Approved' } };
    component.dataSource.data = [
      rejectable,
      approved
    ];

    component.toggleSelection(rejectable, true);
    component.toggleSelection(approved, true);

    expect(component.selectedApplicationIds.has(42)).toBe(true);
    expect(component.selectedApplicationIds.has(43)).toBe(false);

    component.toggleSelection(rejectable, false);

    expect(component.selectedApplicationIds.size).toBe(0);
  });

  it('selects and deselects the visible rejectable page', () => {
    component.dataSource.data = [
      page.pageItems[0],
      { ...page.pageItems[0], loanId: 43 },
      { ...page.pageItems[0], loanId: 44, status: { id: 500, value: 'Rejected' } }
    ];

    component.toggleVisibleSelection(true);

    expect(component.selectedApplicationIds).toEqual(
      new Set([
        42,
        43
      ])
    );
    expect(component.allVisibleSelected()).toBe(true);

    component.toggleVisibleSelection(false);

    expect(component.selectedApplicationIds.size).toBe(0);
  });

  it('prevents mass rejection when no row is selected', () => {
    component.massReject();

    expect(dialog.open).not.toHaveBeenCalled();
    expect(loansService.loanActionButtons).not.toHaveBeenCalled();
    expect(loansService.applyWorkingCapitalLoanAccountCommand).not.toHaveBeenCalled();
    expect(component.rejectionResultMessage).toBe('labels.text.Select at least one credit application to reject');
  });

  it('opens the confirmation dialog before rejecting selected loans', () => {
    component.toggleSelection(page.pageItems[0], true);

    component.massReject();

    expect(dialog.open).toHaveBeenCalledWith(expect.any(Function), {
      data: {
        selectedCount: 1,
        rejectedOnDate: new Date(2026, 8, 8)
      }
    });
  });

  it('calls the existing loan reject command with the rejection payload', () => {
    component.toggleSelection({ ...page.pageItems[0], productType: 'loan' }, true);

    component.massReject();

    expect(loansService.loanActionButtons).toHaveBeenCalledWith(42, 'reject', {
      rejectedOnDate: '2026-09-01',
      note: 'Policy declined',
      dateFormat: 'dd MMMM yyyy',
      locale: 'en'
    });
    expect(loansService.applyWorkingCapitalLoanAccountCommand).not.toHaveBeenCalled();
  });

  it('routes working-capital credit applications to the working-capital reject command', () => {
    component.toggleSelection({ ...page.pageItems[0], productType: 'working-capital' }, true);

    component.massReject();

    expect(loansService.applyWorkingCapitalLoanAccountCommand).toHaveBeenCalledWith(42, 'reject', {
      rejectedOnDate: '2026-09-01',
      note: 'Policy declined',
      dateFormat: 'dd MMMM yyyy',
      locale: 'en'
    });
    expect(loansService.loanActionButtons).not.toHaveBeenCalled();
  });

  it('routes mixed standard and working-capital applications to their own reject commands', () => {
    const applicationWithoutProductType: any = { ...page.pageItems[0] };
    delete applicationWithoutProductType.productType;
    component.dataSource.data = [
      { ...applicationWithoutProductType, loanId: 42, productId: 10, productName: 'Term Loan' },
      { ...applicationWithoutProductType, loanId: 43, productId: 9, productName: 'Working Capital' }
    ];
    component.toggleVisibleSelection(true);

    component.massReject();

    expect(loansService.loanActionButtons).toHaveBeenCalledWith(42, 'reject', expect.any(Object));
    expect(loansService.applyWorkingCapitalLoanAccountCommand).toHaveBeenCalledWith(43, 'reject', expect.any(Object));
  });

  it('does not select rows when the application product type cannot be determined', () => {
    const applicationWithoutProductType: any = { ...page.pageItems[0] };
    delete applicationWithoutProductType.productType;

    component.toggleSelection(
      { ...applicationWithoutProductType, productId: 999, productName: 'Unknown Product' },
      true
    );

    expect(component.selectedApplicationIds.size).toBe(0);
  });

  it('rejects multiple selected loans and refreshes the list after success', () => {
    component.dataSource.data = [
      page.pageItems[0],
      { ...page.pageItems[0], loanId: 43 }
    ];
    component.toggleVisibleSelection(true);
    tasksService.getCreditApplications.mockClear();

    component.massReject();

    expect(loansService.loanActionButtons).toHaveBeenCalledTimes(2);
    expect(loansService.loanActionButtons).toHaveBeenNthCalledWith(1, 42, 'reject', expect.any(Object));
    expect(loansService.loanActionButtons).toHaveBeenNthCalledWith(2, 43, 'reject', expect.any(Object));
    expect(component.rejectionResultMessage).toBe(
      'labels.text.All selected credit applications were rejected successfully'
    );
    expect(component.selectedApplicationIds.size).toBe(0);
    expect(tasksService.getCreditApplications).toHaveBeenCalledTimes(1);
  });

  it('reports partial failure and keeps failed loans selected', () => {
    component.dataSource.data = [
      page.pageItems[0],
      { ...page.pageItems[0], loanId: 43 }
    ];
    loansService.loanActionButtons.mockImplementation((loanId: any) =>
      loanId === 43 ? throwError(() => new Error('reject failed')) : of({ resourceId: loanId })
    );
    component.toggleVisibleSelection(true);

    component.massReject();

    expect(component.rejectionResultMessage).toBe('labels.text.Selected credit applications rejection partial result');
    expect(component.rejectionResultParams).toEqual({ succeeded: 1, total: 2, failed: 1 });
    expect(component.rejectionResultType).toBe('error');
    expect(component.selectedApplicationIds).toEqual(new Set([43]));
  });

  it('removes selected applications that are no longer rejectable on reload', () => {
    const response = new Subject<any>();
    TestBed.resetTestingModule();
    createComponent(response.asObservable());

    response.next(page);
    component.toggleSelection(page.pageItems[0], true);

    expect(component.selectedApplicationIds.has(42)).toBe(true);

    response.next({
      totalFilteredRecords: 1,
      pageItems: [
        {
          ...page.pageItems[0],
          status: {
            id: 200,
            value: 'Approved'
          }
        }
      ]
    });

    expect(component.selectedApplicationIds.has(42)).toBe(false);
  });

  it('reports complete rejection failure', () => {
    loansService.loanActionButtons.mockReturnValue(throwError(() => new Error('reject failed')));
    component.toggleSelection(page.pageItems[0], true);

    component.massReject();

    expect(component.rejectionResultMessage).toBe('labels.text.No selected credit applications could be rejected');
    expect(component.rejectionResultType).toBe('error');
    expect(component.selectedApplicationIds.has(42)).toBe(true);
  });

  it('prevents duplicate submissions while rejection is running', () => {
    const rejectResponse = new Subject<any>();
    loansService.loanActionButtons.mockReturnValue(rejectResponse.asObservable());
    component.toggleSelection(page.pageItems[0], true);

    component.massReject();
    component.massReject();

    expect(dialog.open).toHaveBeenCalledTimes(1);
    expect(loansService.loanActionButtons).toHaveBeenCalledTimes(1);
    expect(component.rejecting).toBe(true);

    rejectResponse.next({ resourceId: 42 });
    rejectResponse.complete();
  });

  it('hides mass reject when the user lacks the reject loan permission', () => {
    environment.productionModeEnableRBAC = true;
    TestBed.resetTestingModule();
    createComponent(of(page), ['READ_LOAN']);

    expect(fixture.nativeElement.textContent).not.toContain('labels.buttons.Mass Reject');
  });
});
