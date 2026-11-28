/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { DatePipe, DecimalPipe } from '@angular/common';
import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { provideNativeDateAdapter } from '@angular/material/core';
import { MatDialog } from '@angular/material/dialog';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { ActivatedRoute, provideRouter } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { Observable, of, Subject, throwError, map } from 'rxjs';
import { signal } from '@angular/core';

import { ClientsService } from 'app/clients/clients.service';
import { AuthenticationService } from 'app/core/authentication/authentication.service';
import { LoansService } from 'app/loans/loans.service';
import { Dates } from 'app/core/utils/dates';
import { SearchService } from 'app/search/search.service';
import { OrganizationService } from 'app/organization/organization.service';
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
        clientId: 1,
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

  function validLoanDetail(row: any = page.pageItems[0]) {
    return {
      id: row.loanId,
      accountNo: row.accountNo,
      clientId: 1,
      loanProductId: row.productId,
      principal: String(row.amount),
      currency: { code: row.currencyCode, decimalPlaces: 2 },
      status: { id: 100, pendingApproval: true },
      timeline: { submittedOnDate: [
          2026,
          1,
          15
        ], expectedDisbursementDate: [
          2026,
          9,
          30
        ] },
      multiDisburseLoan: false,
      loanType: { id: 1 }
    };
  }

  function validApprovalTemplate(): any {
    return { approvalAmount: '1200', expectedDisbursementDate: [
        2026,
        9,
        30
      ] };
  }

  function createComponent(
    creditApplicationsResponse: Observable<any> | ((params: any) => Observable<any>) = of(page),
    permissions: string[] = ['REJECT_LOAN'],
    routePath = 'requests'
  ) {
    const businessDate = signal<Date | null>(new Date(2026, 8, 8));
    tasksService = {
      getCreditApplications: jest.fn((params: any) =>
        typeof creditApplicationsResponse === 'function'
          ? creditApplicationsResponse(params)
          : creditApplicationsResponse
      )
    } as any;
    loansService = {
      getLoanAccountDetails: jest.fn((id) => {
        const row = component?.selectedApplications.get(Number(id)) ?? page.pageItems[0];
        return of(validLoanDetail({ ...row, loanId: Number(id) }));
      }),
      getWorkingCapitalLoanDetails: jest.fn((id) => loansService.getLoanAccountDetails(id)),
      getLoanApprovalTemplate: jest.fn(() => of(validApprovalTemplate())),
      loanActionButtons: jest.fn((id) => of({ resourceId: id })),
      applyWorkingCapitalLoanAccountCommand: jest.fn((id) => of({ resourceId: id }))
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
        { provide: SearchService, useValue: { getSearchResults: jest.fn(() => of([])) } },
        DatePipe,
        DecimalPipe,
        {
          provide: OrganizationService,
          useValue: {
            getCurrencies: jest.fn(() => of({ selectedCurrencyOptions: [{ code: 'USD', decimalPlaces: 2 }] }))
          }
        },
        {
          provide: Dates,
          useValue: {
            angularToMomentFormat: () => 'YYYY-MM-DD',
            getMomentLocale: () => 'en',
            formatDate: (date: Date) =>
              `${date.getFullYear()}-${`${date.getMonth() + 1}`.padStart(2, '0')}-${`${date.getDate()}`.padStart(2, '0')}`,
            isAfter: (date1: Date, date2: Date) => date1.getTime() > date2.getTime()
          }
        },
        { provide: TasksService, useValue: tasksService },
        { provide: LoansService, useValue: loansService },
        { provide: ClientsService, useValue: clientsService },
        { provide: ProductsService, useValue: productsService },
        { provide: MatDialog, useValue: dialog },
        {
          provide: SettingsService,
          useValue: {
            get businessDate() {
              return businessDate();
            },
            set businessDate(value: Date | null) {
              businessDate.set(value);
            },
            decimals: '2',
            dateFormat: 'dd MMMM yyyy',
            language: { code: 'en' }
          }
        },
        { provide: AuthenticationService, useValue: authenticationService },
        provideNativeDateAdapter(),
        provideRouter([]),
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              routeConfig: { path: routePath },
              data: {
                title:
                  routePath === 'credit' ? 'Credit' : routePath === 'mass-rejection' ? 'Mass Rejection' : 'Requests'
              }
            }
          }
        }
      ]
    });

    fixture = TestBed.createComponent(CreditApplicationsComponent);
    component = fixture.componentInstance;
    routerNavigate = jest.spyOn((component as any).router, 'navigate');
    fixture.detectChanges();
  }

  beforeEach(() => {
    const storage = new Map<string, string>();
    (localStorage.getItem as jest.Mock).mockImplementation((key) => storage.get(key) ?? null);
    (localStorage.setItem as jest.Mock).mockImplementation((key, value) => storage.set(key, value));
    (localStorage.removeItem as jest.Mock).mockImplementation((key) => storage.delete(key));
    (localStorage.clear as jest.Mock).mockImplementation(() => storage.clear());
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
    expect((tasksService as any).getLoanApplicationSearchTemplate).toBeUndefined();
    expect(component.loanProductOptions).toEqual([
      { id: 9, name: 'Working Capital', productType: 'working-capital' },
      { id: 10, name: 'Term Loan', productType: 'loan' }
    ]);
    expect(component.statusOptions).toContainEqual(
      expect.objectContaining({ id: 100, labelKey: 'labels.inputs.Submitted and pending approval' })
    );
  });

  it('renders compact filters, current-page search, summary cards and eligible selection on Credit', () => {
    const element = fixture.nativeElement as HTMLElement;
    expect(element.querySelectorAll('.summary-card')).toHaveLength(5);
    expect(element.querySelector('input[formControlName="pageSearch"]')).not.toBeNull();
    expect(element.textContent).toContain('credits.searchScope');
    expect(element.textContent).not.toContain('labels.buttons.Advanced Search');
    expect(component.displayedColumns).toEqual([
      'select',
      'accountNo',
      'clientName',
      'productName',
      'amount',
      'submittedOnDate',
      'status',
      'actions'
    ]);
  });

  it('renders WEB-1475 workspace filters and eligible selection on Requests', () => {
    TestBed.resetTestingModule();
    createComponent(of(page), ['REJECT_LOAN'], 'requests');
    const form = fixture.nativeElement.querySelector('form');
    const controls = Array.from(form.querySelectorAll('[formControlName]')).map((control: Element) =>
      control.getAttribute('formControlName')
    );
    expect(controls).toEqual([
      'pageSearch',
      'clientTypeId',
      'productId'
    ]);
    expect(fixture.nativeElement.querySelectorAll('.summary-card')).toHaveLength(5);
    expect(form.classList).toContain('compact-filters');
    expect(form.textContent).toContain('labels.inputs.Customer Type');
    expect(form.textContent).not.toContain('labels.buttons.Advanced Search');
    expect(component.displayedColumns).toContain('select');
    expect(component.displayedColumns).toContain('actions');
  });

  it('submits supported Requests filters plus server paging and sorting', () => {
    TestBed.resetTestingModule();
    createComponent(of(page), ['READ_LOAN'], 'requests');
    tasksService.getCreditApplications.mockClear();
    component.creditApplicationsForm.patchValue({
      submittedFrom: new Date(2026, 0, 1),
      submittedTo: new Date(2026, 0, 31),
      clientTypeId: 3,
      stateProvinceId: 7,
      municipality: 'Austin',
      productId: 10,
      maxAmount: 1200,
      currencyCode: 'USD'
    });

    component.applyFilters();

    expect(tasksService.getCreditApplications).toHaveBeenCalledWith({
      submittedFrom: '2026-01-01',
      submittedTo: '2026-01-31',
      clientTypeId: 3,
      stateProvinceId: 7,
      municipality: 'Austin',
      productId: 10,
      maxAmount: 1200,
      currencyCode: 'USD',
      offset: 0,
      limit: 25,
      orderBy: 'submittedOnDate',
      sortOrder: 'DESC'
    });
    expect(loansService.loanActionButtons).not.toHaveBeenCalled();
    expect(loansService.applyWorkingCapitalLoanAccountCommand).not.toHaveBeenCalled();
  });

  it('rejects a negative Requests maximum amount without calling the backend', () => {
    TestBed.resetTestingModule();
    createComponent(of(page), ['READ_LOAN'], 'requests');
    tasksService.getCreditApplications.mockClear();
    component.creditApplicationsForm.patchValue({ maxAmount: -1 });

    component.applyFilters();

    expect(component.filterError).toBe('labels.text.Amounts cannot be negative');
    expect(tasksService.getCreditApplications).not.toHaveBeenCalled();
  });

  it('renders streamlined Mass Rejection filters and the persistent panel', () => {
    TestBed.resetTestingModule();
    createComponent(of(page), ['REJECT_LOAN'], 'mass-rejection');
    expect(Object.keys(component.creditApplicationsForm.controls).sort()).toEqual(
      [
        'submittedFrom',
        'submittedTo',
        'pageSearch',
        'clientId',
        'productId'
      ].sort()
    );
    expect(fixture.nativeElement.querySelector('.rejection-panel')).toBeTruthy();
    expect(fixture.nativeElement.textContent).not.toContain('labels.buttons.Advanced Search');
    expect(component.displayedColumns).toEqual([
      'select',
      'clientName',
      'accountNo',
      'amount',
      'submittedOnDate',
      'status'
    ]);
    expect(component.rejectableOnly).toBe(false);
  });

  it('submits date/product filters with server paging and pending-only filtering when toggled', () => {
    TestBed.resetTestingModule();
    createComponent(of(page), ['REJECT_LOAN'], 'mass-rejection');
    tasksService.getCreditApplications.mockClear();
    component.creditApplicationsForm.patchValue({
      submittedFrom: new Date(2026, 0, 1),
      submittedTo: new Date(2026, 0, 31),
      productId: 10
    });
    component.toggleRejectableOnly(true);
    expect(tasksService.getCreditApplications).toHaveBeenCalledWith({
      submittedFrom: '2026-01-01',
      submittedTo: '2026-01-31',
      status: 100,
      productId: 10,
      offset: 0,
      limit: 10,
      orderBy: 'submittedOnDate',
      sortOrder: 'DESC'
    });
    component.toggleRejectableOnly(false);
    expect(tasksService.getCreditApplications).toHaveBeenLastCalledWith(expect.not.objectContaining({ status: 100 }));
  });

  it('uses statuses returned by the authoritative application search on Mass Rejection', () => {
    TestBed.resetTestingModule();
    createComponent(of(page), ['REJECT_LOAN'], 'mass-rejection');

    expect(component.statusOptions.map((status) => status.id)).toEqual([
      100,
      200,
      400,
      500
    ]);
    expect(component.statusOptions).toContainEqual(
      expect.objectContaining({
        id: 100,
        code: 'loanStatusType.submitted.and.pending.approval',
        displayLabel: 'Submitted and pending approval'
      })
    );
  });

  it('exposes contextual actions only after eligible selection on Credit and Requests', () => {
    expect(component.displayedColumns).toContain('select');
    expect(fixture.nativeElement.textContent).not.toContain('labels.buttons.Reject Selected');
    component.toggleSelection(page.pageItems[0], true);
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('labels.buttons.Reject Selected');
    TestBed.resetTestingModule();
    createComponent(of(page), ['REJECT_LOAN'], 'requests');
    expect(component.displayedColumns).toContain('select');
  });

  it('applies filters and resets the current page', () => {
    component.pageIndex = 2;
    component.creditApplicationsForm.patchValue({
      submittedFrom: new Date(2026, 0, 1),
      submittedTo: new Date(2026, 0, 31),
      municipality: 'Austin',
      productId: 9,
      minAmount: 100,
      maxAmount: 500,
      currencyCode: 'USD',
      stateProvinceId: 7
    });

    component.applyFilters();

    expect(component.pageIndex).toBe(0);
    expect(tasksService.getCreditApplications).toHaveBeenCalledWith({
      submittedFrom: '2026-01-01',
      submittedTo: '2026-01-31',
      municipality: 'Austin',
      productId: 9,
      minAmount: 100,
      maxAmount: 500,
      currencyCode: 'USD',
      stateProvinceId: 7,
      offset: 0,
      limit: 25,
      orderBy: 'submittedOnDate',
      sortOrder: 'DESC'
    });
  });

  it('clears filters and reloads the first page', () => {
    component.pageIndex = 3;
    component.filterError = 'labels.text.Amounts cannot be negative';
    component.creditApplicationsForm.patchValue({ minAmount: 10, stateProvinceId: 7 });

    component.clearFilters();

    expect(component.filterError).toBe('');
    expect(component.pageIndex).toBe(0);
    expect(component.creditApplicationsForm.value.minAmount).toBeNull();
    expect(component.creditApplicationsForm.value.stateProvinceId).toBeNull();
    expect(tasksService.getCreditApplications).toHaveBeenCalledWith({
      offset: 0,
      limit: 25,
      orderBy: 'submittedOnDate',
      sortOrder: 'DESC'
    });
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
    component.creditApplicationsForm.patchValue({ minAmount: 200, maxAmount: 100 });

    component.applyFilters();

    expect(component.filterError).toBe('labels.text.Minimum Amount cannot be greater than Maximum Amount');
    expect(tasksService.getCreditApplications).not.toHaveBeenCalled();
  });

  it('requires a currency for amount filters before issuing any reads', () => {
    component.creditApplicationsForm.patchValue({ minAmount: '100.00000001' });
    component.applyFilters();
    expect(component.filterError).toBe('credits.currencyRequired');
    expect(tasksService.getCreditApplications).not.toHaveBeenCalled();
    component.creditApplicationsForm.patchValue({ currencyCode: 'USD' });
    component.applyFilters();
    expect(tasksService.getCreditApplications).toHaveBeenCalledWith(
      expect.objectContaining({ minAmount: '100.00000001', currencyCode: 'USD' })
    );
  });

  it.each([
    [
      'submittedFrom',
      new Date(2026, 0, 2),
      'submittedFrom',
      '2026-01-02'
    ],
    [
      'stateProvinceId',
      7,
      'stateProvinceId',
      7
    ],
    [
      'municipality',
      'Austin',
      'municipality',
      'Austin'
    ],
    [
      'productId',
      9,
      'productId',
      9
    ]
  ])('maps the %s Credit filter to only its supported API parameter', (control, value, parameter, expected) => {
    component.creditApplicationsForm.patchValue({ [control]: value });

    component.applyFilters();

    expect(tasksService.getCreditApplications).toHaveBeenCalledWith({
      [parameter]: expected,
      offset: 0,
      limit: 25,
      orderBy: 'submittedOnDate',
      sortOrder: 'DESC'
    });
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
    expect(tasksService.getCreditApplications.mock.calls.filter(([params]) => params.limit !== 1)).toHaveLength(1);
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

  it('keeps the existing credit result row rendering unchanged', () => {
    fixture.detectChanges();
    const tableText = fixture.nativeElement.querySelector('table').textContent;

    expect(tableText).toContain('LN-42');
    expect(tableText).toContain('Alex Client');
    expect(tableText).toContain('Term Loan');
    expect(component.dataSource.data).toEqual(page.pageItems);
  });

  it('shows an error state when loading fails', () => {
    TestBed.resetTestingModule();
    createComponent(throwError(() => new Error('network')));

    expect(component.loading).toBe(false);
    expect(component.dataSource.data).toEqual([]);
    expect(component.loadFailed).toBe(true);
    expect(component.filterError).toBe('labels.text.Unable to load credit applications');
    expect(fixture.nativeElement.textContent).not.toContain('labels.text.No credit applications found');
  });

  it('retries a failed request', () => {
    TestBed.resetTestingModule();
    createComponent(throwError(() => new Error('network')));
    tasksService.getCreditApplications.mockReturnValue(of(page));
    tasksService.getCreditApplications.mockClear();

    component.retryLoad();

    expect(tasksService.getCreditApplications.mock.calls.filter(([params]) => params.limit !== 1)).toHaveLength(1);
    expect(component.loadFailed).toBe(false);
    expect(component.dataSource.data).toEqual(page.pageItems);
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

  it('keeps pending applications selectable when the response omits the status code', () => {
    const pendingWithoutCode = {
      ...page.pageItems[0],
      status: { id: 100, value: 'Submitted and pending approval' }
    };

    expect(component.isRejectable(pendingWithoutCode)).toBe(true);
    component.toggleSelection(pendingWithoutCode, true);
    expect(component.selectedApplicationIds).toEqual(new Set([42]));
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

  it('uses the normal loan rejection flow when optional product type metadata is absent', () => {
    const applicationWithoutProductType: any = { ...page.pageItems[0] };
    delete applicationWithoutProductType.productType;

    component.toggleSelection(
      { ...applicationWithoutProductType, productId: 999, productName: 'Unknown Product' },
      true
    );

    expect(component.selectedApplicationIds).toEqual(new Set([42]));
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
    expect(tasksService.getCreditApplications.mock.calls.filter(([params]) => params.limit !== 1)).toHaveLength(1);
  });

  it('reports partial failure and clears financial selection before refresh', () => {
    component.dataSource.data = [
      page.pageItems[0],
      { ...page.pageItems[0], loanId: 43 }
    ];
    loansService.loanActionButtons.mockImplementation((loanId: any) =>
      loanId === 43 ? throwError(() => ({ status: 400 })) : of({ resourceId: loanId })
    );
    component.toggleVisibleSelection(true);

    component.massReject();

    expect(component.rejectionResultMessage).toBe('labels.text.Selected credit applications rejection partial result');
    expect(component.rejectionResultParams).toEqual({ succeeded: 1, total: 2, failed: 1 });
    expect(component.rejectionResultType).toBe('error');
    expect(component.selectedApplicationIds.size).toBe(0);
    expect(component.failedApplications).toEqual([expect.objectContaining({ loanId: 43, accountNo: 'LN-42' })]);
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
    loansService.loanActionButtons.mockReturnValue(throwError(() => ({ status: 400 })));
    component.toggleSelection(page.pageItems[0], true);

    component.massReject();

    expect(component.rejectionResultMessage).toBe('labels.text.No selected credit applications could be rejected');
    expect(component.rejectionResultType).toBe('error');
    expect(component.selectedApplicationIds.size).toBe(0);
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
    createComponent(of(page), ['READ_LOAN'], 'mass-rejection');

    expect(fixture.nativeElement.textContent).not.toContain('labels.buttons.Reject Selected');
  });
  it('uses server totals for every summary and never fabricates a portfolio total', () => {
    tasksService.getCreditApplications.mockImplementation((params: any) =>
      of({
        pageItems: [],
        totalFilteredRecords: params.status === 100 ? 8 : params.status === 300 ? 39 : params.status === 500 ? 5 : 55
      })
    );
    component.creditApplicationsForm.patchValue({ productId: 10 });
    component.applyFilters();
    expect(component.summaryCounts).toEqual({ '': 55, '100': 8, '200': 55, '300': 39, '500': 5 });
    expect(fixture.nativeElement.textContent).not.toContain('34.6');
    component.selectStatus(300);
    expect(tasksService.getCreditApplications).toHaveBeenLastCalledWith(
      expect.objectContaining({ productId: 10, status: 300, offset: 0 })
    );
    expect(component.summaryCounts['']).toBe(55);
    component.selectStatus('');
    expect(tasksService.getCreditApplications).toHaveBeenLastCalledWith(
      expect.not.objectContaining({ status: expect.anything() })
    );
  });

  it('represents summary errors as unavailable, independently from the table', () => {
    tasksService.getCreditApplications.mockImplementation((params: any) =>
      params.limit === 1 ? throwError(() => ({ status: 403 })) : of(page)
    );
    component.creditApplicationsForm.patchValue({ productId: 10 });
    component.applyFilters();
    expect(component.summaryCounts['100']).toBeNull();
    expect(component.loadFailed).toBe(false);
    expect(component.totalFilteredRecords).toBe(1);
  });

  it('cancels stale page and summary requests when filters change', () => {
    const oldPage = new Subject<any>();
    const newPage = new Subject<any>();
    const oldSummary = new Subject<any>();
    tasksService.getCreditApplications.mockImplementation((params: any) =>
      params.productId === 9 ? (params.limit === 1 ? oldSummary : oldPage) : newPage
    );
    component.creditApplicationsForm.patchValue({ productId: 9 });
    component.applyFilters();
    component.creditApplicationsForm.patchValue({ productId: 10 });
    component.applyFilters();
    newPage.next({ totalFilteredRecords: 2, pageItems: [{ ...page.pageItems[0], accountNo: '000002' }] });
    oldPage.next(page);
    oldSummary.next({ totalFilteredRecords: 999 });
    expect(component.dataSource.data[0].accountNo).toBe('000002');
    expect(component.totalFilteredRecords).toBe(2);
    expect(oldPage.observed).toBe(false);
    expect(oldSummary.observed).toBe(false);
  });

  it('debounces explicitly page-local search without issuing a server query', fakeAsync(() => {
    component.toggleVisibleSelection(true);
    component.creditApplicationsForm.get('pageSearch').setValue('Nobody');
    tick(299);
    expect(component.dataSource.data).toHaveLength(1);
    tick(1);
    expect(component.dataSource.data).toHaveLength(0);
    expect(component.selectedApplicationIds.size).toBe(0);
    expect(tasksService.getCreditApplications).not.toHaveBeenCalled();
  }));

  it('clears selection on pagination, sort and filter changes', () => {
    for (const change of [
      () => component.changePaging({ pageIndex: 1, pageSize: 25 } as any),
      () => component.sortData({ active: 'amount', direction: 'asc' }),
      () => component.applyFilters()
    ]) {
      component.toggleSelection(page.pageItems[0], true);
      change();
      expect(component.selectedApplicationIds.size).toBe(0);
    }
  });

  it('keeps leading zeros, translated status, metadata and currency precision', () => {
    component.dataSource.data = [{ ...page.pageItems[0], accountNo: '00000042', amount: '1234.50' }];
    fixture.detectChanges();
    const table = fixture.nativeElement.querySelector('table');
    expect(table.textContent).toContain('00000042');
    expect(table.textContent).toContain('1,234.50');
    expect(table.textContent).toContain('USD');
    expect(table.textContent).toContain('Business');
    expect(table.textContent).toContain('Texas / Austin');
    expect(table.textContent).toContain('credits.pending');
    expect(component.statusKey({ status: { id: 999, value: 'Extension status' } })).toBe('');
    expect(component.statusTone({ status: { id: 200 } })).toBe('approved');
    expect(component.currencyDigits('JPY')).toBe(0);
    expect(component.currencyDigits('KWD')).toBe(3);
  });

  it('requires explicit mutation permissions even when menu RBAC is disabled', () => {
    authenticationService.getCredentials.mockReturnValue({ permissions: ['READ_LOAN'] } as any);
    component.toggleVisibleSelection(true);
    component.massApprove();
    component.massReject();
    expect(component.selectedApplicationIds.size).toBe(0);
    expect(dialog.open).not.toHaveBeenCalled();
    expect(loansService.loanActionButtons).not.toHaveBeenCalled();
  });

  it('confirms approval, uses the selected business date and prevents duplicate commands', () => {
    authenticationService.getCredentials.mockReturnValue({ permissions: ['APPROVE_LOAN'] } as any);
    const response = new Subject<any>();
    loansService.loanActionButtons.mockReturnValue(response);
    component.toggleVisibleSelection(true);
    component.massApprove();
    component.massApprove();
    expect(dialog.open).toHaveBeenCalledTimes(1);
    expect(dialog.open).toHaveBeenCalledWith(
      expect.any(Function),
      expect.objectContaining({
        data: expect.objectContaining({
          operation: 'approve',
          accounts: ['LN-42'],
          rejectedOnDate: new Date(2026, 8, 8)
        })
      })
    );
    expect(loansService.loanActionButtons).toHaveBeenCalledTimes(1);
    expect(loansService.loanActionButtons).toHaveBeenCalledWith(42, 'approve', {
      approvedOnDate: '2026-09-01',
      expectedDisbursementDate: '2026-09-30',
      dateFormat: 'dd MMMM yyyy',
      locale: 'en'
    });
    component.changePaging({ pageIndex: 2, pageSize: 25 } as any);
    expect(component.pageIndex).toBe(0);
    response.next({ resourceId: 42 });
    response.complete();
    expect(component.batchOutcomes[0].outcome).toBe('succeeded');
    expect(component.selectedApplicationIds.size).toBe(0);
  });

  it('does not approve working-capital or already-active applications in a batch', () => {
    authenticationService.getCredentials.mockReturnValue({ permissions: ['APPROVE_LOAN'] } as any);
    component.toggleSelection({ ...page.pageItems[0], productType: 'working-capital' }, true);
    component.toggleSelection({ ...page.pageItems[0], status: { id: 300 } }, true);
    component.massApprove();
    expect(dialog.open).not.toHaveBeenCalled();
    expect(loansService.applyWorkingCapitalLoanAccountCommand).not.toHaveBeenCalled();
  });

  it('handles approval cancellation, complete failure, partial success and uncertain outcomes', () => {
    authenticationService.getCredentials.mockReturnValue({ permissions: ['APPROVE_LOAN'] } as any);
    component.dataSource.data = [
      page.pageItems[0],
      { ...page.pageItems[0], loanId: 43 },
      { ...page.pageItems[0], loanId: 44 }
    ];
    dialog.open.mockReturnValueOnce({ afterClosed: () => of({ confirm: false }) } as any);
    component.toggleVisibleSelection(true);
    component.massApprove();
    expect(loansService.loanActionButtons).not.toHaveBeenCalled();
    loansService.loanActionButtons.mockImplementation((id: any) =>
      id === 42 ? of({ resourceId: 42 }) : throwError(() => ({ status: id === 43 ? 400 : 0 }))
    );
    component.massApprove();
    expect(component.outcomeCounts).toEqual({ total: 3, queued: 0, succeeded: 1, failed: 1, uncertain: 1 });
    expect(component.rejectionResultMessage).toBe('credits.uncertainResult');
    expect(loansService.loanActionButtons).toHaveBeenCalledTimes(3);
    component.toggleSelection(page.pageItems[0], true);
    loansService.loanActionButtons.mockReturnValue(throwError(() => ({ status: 400 })));
    component.massApprove();
    expect(component.outcomeCounts).toEqual({ total: 1, queued: 0, succeeded: 0, failed: 1, uncertain: 0 });
  });

  it('exports selected records with exact amounts and safe account numbers', async () => {
    const createDescriptor = Object.getOwnPropertyDescriptor(URL, 'createObjectURL');
    const revokeDescriptor = Object.getOwnPropertyDescriptor(URL, 'revokeObjectURL');
    const createUrl = jest.fn((_blob: Blob) => 'blob:synthetic');
    const revokeUrl = jest.fn();
    Object.defineProperty(URL, 'createObjectURL', { value: createUrl, configurable: true });
    Object.defineProperty(URL, 'revokeObjectURL', { value: revokeUrl, configurable: true });
    const click = jest.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => undefined);
    let cleanup: () => void;
    const timeout = jest.spyOn(global, 'setTimeout').mockImplementationOnce((handler) => {
      cleanup = handler as () => void;
      return 0 as any;
    });
    try {
      component.toggleSelection(
        { ...page.pageItems[0], accountNo: '000042', amount: '1234.50000001', clientName: '=WEBSERVICE("x")' },
        true
      );
      component.exportCsv();
      expect(tasksService.getCreditApplications).not.toHaveBeenCalled();
      expect(createUrl).toHaveBeenCalledWith(expect.any(Blob));
      const blob = createUrl.mock.calls[0][0] as Blob;
      const csv = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(String(reader.result));
        reader.onerror = () => reject(reader.error);
        reader.readAsText(blob);
      });
      expect(csv).toContain('"\'000042"');
      expect(csv).toContain('"1234.50000001"');
      expect(csv).toContain('"\'=WEBSERVICE(""x"")"');
      expect(csv.trim().split('\r\n')).toHaveLength(2);
      expect(click).toHaveBeenCalledTimes(1);
    } finally {
      cleanup?.();
      timeout.mockRestore();
      click.mockRestore();
      if (createDescriptor) Object.defineProperty(URL, 'createObjectURL', createDescriptor);
      else delete URL.createObjectURL;
      if (revokeDescriptor) Object.defineProperty(URL, 'revokeObjectURL', revokeDescriptor);
      else delete URL.revokeObjectURL;
    }
  });

  it('exports every filtered page and never downloads failed or incomplete exports', () => {
    const click = jest.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => undefined);
    Object.defineProperty(URL, 'createObjectURL', { value: jest.fn(() => 'blob:synthetic'), configurable: true });
    Object.defineProperty(URL, 'revokeObjectURL', { value: jest.fn(), configurable: true });
    tasksService.getCreditApplications.mockImplementation((params: any) =>
      of({
        totalFilteredRecords: 201,
        pageItems: Array.from({ length: params.offset === 0 ? 200 : 1 }, (_, i) => ({
          ...page.pageItems[0],
          loanId: params.offset + i
        }))
      })
    );
    component.exportCsv();
    expect(tasksService.getCreditApplications).toHaveBeenCalledWith(
      expect.objectContaining({ offset: 200, limit: 200 })
    );
    expect(click).toHaveBeenCalledTimes(1);
    tasksService.getCreditApplications.mockReturnValue(of({ totalFilteredRecords: 2, pageItems: page.pageItems }));
    component.exportCsv();
    expect(component.exportError).toBe(true);
    expect(click).toHaveBeenCalledTimes(1);
    tasksService.getCreditApplications.mockReturnValue(throwError(() => ({ status: 403 })));
    component.exportCsv();
    expect(component.exportError).toBe(true);
    expect(click).toHaveBeenCalledTimes(1);
    click.mockRestore();
  });
  it('uses calendar ages for today, yesterday, older, missing and future dates', () => {
    const translate = (component as any).translateService;
    const spy = jest.spyOn(translate, 'instant');
    const now = new Date(2026, 8, 8);
    component.relativeDate(now);
    expect(spy).toHaveBeenLastCalledWith('credits.today', { count: 0 });
    const yesterday = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1);
    component.relativeDate(yesterday);
    expect(spy).toHaveBeenLastCalledWith('credits.yesterday', { count: 1 });
    const older = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 14);
    component.relativeDate(older);
    expect(spy).toHaveBeenLastCalledWith('credits.daysAgo', { count: 14 });
    const future = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 2);
    component.relativeDate(future);
    expect(spy).toHaveBeenLastCalledWith('credits.futureDays', { count: 2 });
    expect(component.relativeDate(null)).toBe('');
  });
  it('blocks approval if the configured business date is unavailable', () => {
    authenticationService.getCredentials.mockReturnValue({ permissions: ['APPROVE_LOAN'] } as any);
    TestBed.inject(SettingsService).setBusinessDate?.('');
    (component as any).settingsService.businessDate = null;
    component.toggleVisibleSelection(true);
    component.massApprove();
    expect(dialog.open).not.toHaveBeenCalled();
  });
  it('resolves an explicitly selected authorized client into the supported server clientId filter', fakeAsync(() => {
    authenticationService.getCredentials.mockReturnValue({ permissions: [
        'READ_LOAN',
        'READ_CLIENT'
      ] } as any);
    const search = TestBed.inject(SearchService);
    const lookup = jest
      .spyOn(search, 'getSearchResults')
      .mockReturnValue(of([{ entityId: 7, entityName: 'Resolved client', entityType: 'CLIENT' }]));
    component.creditApplicationsForm.get('pageSearch').setValue('Resolved');
    tick(300);
    expect(lookup).toHaveBeenCalledWith('Resolved', 'clients');
    component.selectClient(component.clientMatches[0]);
    expect(tasksService.getCreditApplications).toHaveBeenLastCalledWith(
      expect.objectContaining({ clientId: 7, offset: 0 })
    );
    expect(component.creditApplicationsForm.get('pageSearch').value).toBe('');
    component.clearClient();
    expect(tasksService.getCreditApplications).toHaveBeenLastCalledWith(
      expect.not.objectContaining({ clientId: expect.anything() })
    );
  }));
  it('does not request client search without read-client permission', fakeAsync(() => {
    authenticationService.getCredentials.mockReturnValue({ permissions: ['READ_LOAN'] } as any);
    const search = jest.spyOn(TestBed.inject(SearchService), 'getSearchResults');
    component.creditApplicationsForm.get('pageSearch').setValue('Client');
    tick(300);
    expect(search).not.toHaveBeenCalled();
  }));
  it('keeps All available when Active cancels the initial unfiltered page', () => {
    const initialPage = new Subject<any>();
    TestBed.resetTestingModule();
    createComponent((params) =>
      params.limit === 1
        ? of({ totalFilteredRecords: params.status ? 8 : 52 })
        : params.status === 300
          ? of({ totalFilteredRecords: 39, pageItems: [] })
          : initialPage
    );
    component.selectStatus(300);
    expect(initialPage.observed).toBe(false);
    expect(component.summaryCounts['']).toBe(52);
    expect(component.totalFilteredRecords).toBe(39);
    expect(tasksService.getCreditApplications).toHaveBeenLastCalledWith(expect.objectContaining({ status: 300 }));
  });

  it.each([
    true,
    false
  ])('does not replace a newer All page count with an older summary (All received early=%s)', (early) => {
    const table = new Subject<any>();
    const all = new Subject<any>();
    const pending = new Subject<any>();
    tasksService.getCreditApplications.mockImplementation((params: any) =>
      params.limit !== 1
        ? table
        : !params.status
          ? all
          : params.status === 100
            ? pending
            : of({ totalFilteredRecords: 5 })
    );
    component.creditApplicationsForm.patchValue({ productId: 10 });
    component.applyFilters();
    if (early) {
      all.next({ totalFilteredRecords: 52 });
      all.complete();
    }
    table.next({ totalFilteredRecords: 55, pageItems: [] });
    if (!early) {
      all.next({ totalFilteredRecords: 52 });
      all.complete();
    }
    pending.next({ totalFilteredRecords: 8 });
    pending.complete();
    expect(component.summaryCounts['']).toBe(55);
    expect(component.summaryCounts['100']).toBe(8);
    expect(component.summaryLoading).toBe(false);
  });

  it('does not submit server filters when Enter is pressed in page search', () => {
    const event = new KeyboardEvent('keydown', {
      key: 'Enter',
      code: 'Enter',
      keyCode: 13,
      bubbles: true,
      cancelable: true
    });
    fixture.nativeElement.querySelector('input[formControlName="pageSearch"]').dispatchEvent(event);
    expect(event.defaultPrevented).toBe(true);
    expect(tasksService.getCreditApplications).not.toHaveBeenCalled();
  });

  it('cancels pending lookups and allows the same query after client selection and paging', fakeAsync(() => {
    authenticationService.getCredentials.mockReturnValue({ permissions: [
        'READ_CLIENT',
        'READ_LOAN'
      ] } as any);
    const pendingLookup = new Subject<any>();
    const lookup = jest.spyOn(TestBed.inject(SearchService), 'getSearchResults').mockReturnValue(pendingLookup);
    component.creditApplicationsForm.get('pageSearch').setValue('Alex');
    tick(300);
    expect(lookup).toHaveBeenCalledTimes(1);
    expect(pendingLookup.observed).toBe(true);
    component.selectClient({ entityId: 7, entityName: 'Alex Client' });
    expect(pendingLookup.observed).toBe(false);
    component.creditApplicationsForm.get('pageSearch').setValue('Alex');
    tick(300);
    expect(lookup).toHaveBeenCalledTimes(2);
    component.changePaging({ pageIndex: 1, pageSize: 25 } as any);
    expect(pendingLookup.observed).toBe(false);
    const reads = tasksService.getCreditApplications.mock.calls.length;
    component.creditApplicationsForm.get('pageSearch').setValue('Alex');
    tick(300);
    expect(lookup).toHaveBeenCalledTimes(3);
    expect(tasksService.getCreditApplications).toHaveBeenCalledTimes(reads);
  }));

  it('preserves the rejection snapshot while a pending search debounce expires during confirmation', fakeAsync(() => {
    const confirmation = new Subject<any>();
    dialog.open.mockReturnValue({ afterClosed: () => confirmation } as any);
    component.toggleSelection(page.pageItems[0], true);
    component.creditApplicationsForm.get('pageSearch').setValue('Unmatched');
    component.massReject();
    tick(300);
    expect(component.selectedApplicationIds.has(42)).toBe(true);
    confirmation.next({ confirm: true, data: { rejectedOnDate: new Date(2026, 8, 1), note: 'Reviewed' } });
    expect(loansService.loanActionButtons).toHaveBeenCalledWith(
      42,
      'reject',
      expect.objectContaining({ note: 'Reviewed' })
    );
    expect(component.creditApplicationsForm.enabled).toBe(true);
  }));

  it.each([
    'selection',
    'permission'
  ])('explicitly cancels confirmed rejection after %s changes', (change) => {
    const confirmation = new Subject<any>();
    dialog.open.mockReturnValue({ afterClosed: () => confirmation } as any);
    component.toggleSelection(page.pageItems[0], true);
    component.massReject();
    if (change === 'selection') component.clearSelection();
    else authenticationService.getCredentials.mockReturnValue({ permissions: ['READ_LOAN'] } as any);
    confirmation.next({ confirm: true, data: { rejectedOnDate: new Date(2026, 8, 1) } });
    expect(loansService.loanActionButtons).not.toHaveBeenCalled();
    expect(component.creditApplicationsForm.enabled).toBe(true);
    expect(component.rejectionResultMessage).toBe('credits.rejectionCanceled');
  });

  it('clears previous rejection details only when approval is confirmed', () => {
    authenticationService.getCredentials.mockReturnValue({ permissions: ['APPROVE_LOAN'] } as any);
    const confirmation = new Subject<any>();
    const response = new Subject<any>();
    dialog.open.mockReturnValue({ afterClosed: () => confirmation } as any);
    loansService.loanActionButtons.mockReturnValue(response);
    component.failedApplications = [page.pageItems[0]];
    component.rejectionResultParams = { failed: 1 };
    component.toggleSelection(page.pageItems[0], true);
    component.massApprove();
    confirmation.next({ confirm: false });
    expect(component.failedApplications).toHaveLength(1);
    expect(component.rejectionResultParams).toEqual({ failed: 1 });
    confirmation.complete();
    dialog.open.mockReturnValue({
      afterClosed: () => of({ confirm: true, data: { rejectedOnDate: new Date(2026, 8, 1) } })
    } as any);
    component.massApprove();
    expect(component.failedApplications).toEqual([]);
    expect(component.rejectionResultParams).toEqual({});
    response.next({ resourceId: 42 });
    response.complete();
  });
  it('loads an authoritative pending-overdue count with all applicable filters', () => {
    tasksService.getCreditApplications.mockImplementation((params: any) =>
      of({
        pageItems: [],
        totalFilteredRecords: params.status === 100 && params.submittedTo === '2026-08-28' ? 23 : 71
      })
    );
    component.creditApplicationsForm.patchValue({
      clientTypeId: 3,
      productId: 10,
      submittedFrom: new Date(2026, 7, 1),
      status: 300
    });
    component.applyFilters();
    expect(tasksService.getCreditApplications).toHaveBeenCalledWith({
      clientTypeId: 3,
      productId: 10,
      status: 100,
      submittedFrom: '2026-08-01',
      submittedTo: '2026-08-28',
      limit: 1,
      offset: 0
    });
    expect(component.overduePendingCount).toBe(23);
    component.creditApplicationsForm.patchValue({ submittedFrom: new Date(2026, 8, 1) });
    component.applyFilters();
    expect(component.overduePendingCount).toBe(0);
  });
  it('highlights only pending applications more than ten business-calendar days old', () => {
    expect(
      component.isOverdue({ status: { id: 100 }, submittedOnDate: [
          2026,
          8,
          28
        ] })
    ).toBe(true);
    expect(
      component.isOverdue({ status: { id: 100 }, submittedOnDate: [
          2026,
          8,
          29
        ] })
    ).toBe(false);
    expect(
      component.isOverdue({ status: { id: 200 }, submittedOnDate: [
          2026,
          8,
          1
        ] })
    ).toBe(false);
    expect(
      component.isOverdue({ status: { id: 100 }, submittedOnDate: [
          2026,
          9,
          9
        ] })
    ).toBe(false);
  });
  it('keeps exact selected totals separate for each currency and its precision', () => {
    component.toggleSelection({ ...page.pageItems[0], amount: '0.10' }, true);
    component.toggleSelection({ ...page.pageItems[0], loanId: 43, amount: '0.20' }, true);
    component.toggleSelection({ ...page.pageItems[0], loanId: 44, amount: '123', currencyCode: 'JPY' }, true);
    expect(component.selectedTotals).toEqual([
      { code: 'USD', digits: 2, amount: '0.30' },
      { code: 'JPY', digits: 0, amount: '123' }
    ]);
  });
  it('rejects a stale status in otherwise valid loan details', () => {
    const detail = validLoanDetail();
    detail.status = { ...detail.status, id: 300, pendingApproval: false };
    loansService.getLoanAccountDetails.mockReturnValue(of(detail));
    component.toggleSelection(page.pageItems[0], true);

    component.massReject();

    expect(loansService.loanActionButtons).not.toHaveBeenCalled();
    expect(component.batchOutcomes[0].outcome).toBe('failed');
  });

  it('rejects an invalid submission date while the status remains pending', () => {
    const detail = validLoanDetail();
    detail.timeline.submittedOnDate = [
      2026,
      2,
      30
    ];
    loansService.getLoanAccountDetails.mockReturnValue(of(detail));
    component.toggleSelection(page.pageItems[0], true);

    component.massReject();

    expect(loansService.loanActionButtons).not.toHaveBeenCalled();
    expect(component.batchOutcomes[0].outcome).toBe('failed');
  });

  describe('standard approval requirements', () => {
    beforeEach(() => {
      authenticationService.getCredentials.mockReturnValue({ permissions: ['APPROVE_LOAN'] } as any);
      loansService.getLoanAccountDetails.mockReturnValue(of(validLoanDetail()));
      loansService.getLoanApprovalTemplate.mockReturnValue(of(validApprovalTemplate()));
      component.toggleSelection(page.pageItems[0], true);
    });

    it.each([
      'en',
      'de',
      'es',
      'it',
      'pt',
      'fr'
    ])('preserves the backend principal with the %s UI locale', (locale) => {
      const row = { ...page.pageItems[0], amount: '1234.50' };
      TestBed.inject(SettingsService).language.code = locale;
      loansService.getLoanAccountDetails.mockReturnValue(of(validLoanDetail(row)));
      loansService.getLoanApprovalTemplate.mockReturnValue(
        of({ ...validApprovalTemplate(), approvalAmount: '1234.50' })
      );
      component.clearSelection();
      component.toggleSelection(row, true);

      component.massApprove();

      expect(loansService.loanActionButtons).toHaveBeenCalledTimes(1);
      expect(loansService.loanActionButtons).toHaveBeenCalledWith(
        42,
        'approve',
        expect.objectContaining({ locale, expectedDisbursementDate: '2026-09-30' })
      );
      expect(loansService.loanActionButtons.mock.calls[0][2]).not.toHaveProperty('approvedLoanAmount');
      expect(component.batchOutcomes[0].outcome).toBe('succeeded');
    });

    it('rejects multi-disbursement independently of other required fields', () => {
      const detail = validLoanDetail();
      detail.multiDisburseLoan = true;
      loansService.getLoanAccountDetails.mockReturnValue(of(detail));

      component.massApprove();

      expect(loansService.loanActionButtons).not.toHaveBeenCalled();
      expect(component.batchOutcomes[0].outcome).toBe('failed');
    });

    it('rejects a missing approval amount independently of multi-disbursement', () => {
      const template = validApprovalTemplate();
      delete template.approvalAmount;
      loansService.getLoanApprovalTemplate.mockReturnValue(of(template));

      component.massApprove();

      expect(loansService.loanActionButtons).not.toHaveBeenCalled();
      expect(component.batchOutcomes[0].outcome).toBe('failed');
    });
  });
  it('reports maker-checker queuing without claiming the loan was approved', () => {
    authenticationService.getCredentials.mockReturnValue({ permissions: ['APPROVE_LOAN'] } as any);
    component.toggleSelection(page.pageItems[0], true);
    loansService.loanActionButtons.mockReturnValue(of({ commandId: 77 }));
    component.massApprove();
    expect(component.batchOutcomes[0].outcome).toBe('queued');
    expect(component.outcomeCounts.queued).toBe(1);
  });
  it('rejects unrecognized sorts and page limits without a backend request', () => {
    tasksService.getCreditApplications.mockClear();
    component.sortData({ active: 'unsupported', direction: 'asc' });
    component.changePaging({ pageIndex: 0, pageSize: 201 } as any);
    expect(tasksService.getCreditApplications).not.toHaveBeenCalled();
  });
  describe.each([
    'approve',
    'reject'
  ] as const)('%s review regressions', (operation) => {
    const runBatch = () => (operation === 'approve' ? component.massApprove() : component.massReject());
    beforeEach(() => {
      authenticationService.getCredentials.mockReturnValue({ permissions: [
          'APPROVE_LOAN',
          'REJECT_LOAN'
        ] } as any);
    });

    it('refreshes a deferred business-date change after cancellation, preserving filters', () => {
      component.creditApplicationsForm.patchValue({ clientTypeId: 3, productId: 10 });
      component.applyFilters();
      component.pageIndex = 2;
      component.orderBy = 'amount';
      component.sortOrder = 'ASC';
      const pageRows = component.dataSource.data;
      const total = component.totalFilteredRecords;
      const confirmation = new Subject<any>();
      dialog.open.mockReturnValue({ afterClosed: () => confirmation } as any);
      component.toggleSelection(page.pageItems[0], true);
      runBatch();
      tasksService.getCreditApplications.mockClear();
      (TestBed.inject(SettingsService) as any).businessDate = new Date(2026, 8, 9);
      fixture.detectChanges();
      expect(tasksService.getCreditApplications).not.toHaveBeenCalled();
      expect(component.selectedApplicationIds.has(42)).toBe(true);
      confirmation.next({ confirm: false });
      expect(tasksService.getCreditApplications).toHaveBeenCalledWith({
        clientTypeId: 3,
        productId: 10,
        status: 100,
        submittedTo: '2026-08-29',
        offset: 0,
        limit: 1
      });
      expect(tasksService.getCreditApplications.mock.calls.filter(([params]) => params.limit !== 1)).toHaveLength(0);
      expect(component.pageIndex).toBe(2);
      expect(component.pageSize).toBe(25);
      expect(component.orderBy).toBe('amount');
      expect(component.sortOrder).toBe('ASC');
      expect(component.dataSource.data).toBe(pageRows);
      expect(component.totalFilteredRecords).toBe(total);
      expect(component.selectedApplicationIds.has(42)).toBe(true);
      expect(component.creditApplicationsForm.enabled).toBe(true);
      expect(loansService.loanActionButtons).not.toHaveBeenCalled();
    });

    it.each([
      false,
      true
    ])('does not reload when cancellation leaves the reference day unchanged (changed back=%s)', (changedBack) => {
      const confirmation = new Subject<any>();
      dialog.open.mockReturnValue({ afterClosed: () => confirmation } as any);
      component.toggleSelection(page.pageItems[0], true);
      runBatch();
      tasksService.getCreditApplications.mockClear();
      if (changedBack) {
        (TestBed.inject(SettingsService) as any).businessDate = new Date(2026, 8, 9);
        fixture.detectChanges();
      }
      (TestBed.inject(SettingsService) as any).businessDate = new Date(2026, 8, 8);
      fixture.detectChanges();
      confirmation.next({ confirm: false });
      expect(tasksService.getCreditApplications).not.toHaveBeenCalled();
      expect(component.selectedApplicationIds.has(42)).toBe(true);
    });

    it('refreshes the changed day when confirmation fails validation', () => {
      const confirmation = new Subject<any>();
      dialog.open.mockReturnValue({ afterClosed: () => confirmation } as any);
      component.toggleSelection(page.pageItems[0], true);
      runBatch();
      tasksService.getCreditApplications.mockClear();
      (TestBed.inject(SettingsService) as any).businessDate = new Date(2026, 8, 9);
      fixture.detectChanges();
      confirmation.next({ confirm: true, data: { rejectedOnDate: new Date(2026, 8, 10) } });
      expect(tasksService.getCreditApplications).toHaveBeenCalledWith(
        expect.objectContaining({ status: 100, submittedTo: '2026-08-29' })
      );
      expect(loansService.loanActionButtons).not.toHaveBeenCalled();
      expect(component.busy).toBe(false);
    });

    it('keeps the confirmed snapshot until commands finish, then refreshes the changed day once', () => {
      const confirmation = new Subject<any>();
      const command = new Subject<any>();
      dialog.open.mockReturnValue({ afterClosed: () => confirmation } as any);
      loansService.loanActionButtons.mockReturnValue(command);
      component.toggleSelection(page.pageItems[0], true);
      runBatch();
      tasksService.getCreditApplications.mockClear();
      (TestBed.inject(SettingsService) as any).businessDate = new Date(2026, 8, 9);
      fixture.detectChanges();
      confirmation.next({ confirm: true, data: { rejectedOnDate: new Date(2026, 8, 1) } });
      expect(component.busy).toBe(true);
      expect(tasksService.getCreditApplications).not.toHaveBeenCalled();
      command.next({ resourceId: 42 });
      command.complete();
      fixture.detectChanges();
      expect(component.batchOutcomes[0].outcome).toBe('succeeded');
      expect(tasksService.getCreditApplications).toHaveBeenCalledWith(
        expect.objectContaining({ status: 100, submittedTo: '2026-08-29' })
      );
      expect(tasksService.getCreditApplications.mock.calls.filter(([params]) => params.limit !== 1)).toHaveLength(1);
    });

    describe.each(
      operation === 'approve' ? [
            'detail',
            'template'
          ] : ['detail']
    )('pending %s read', (readKind) => {
      it.each([
        { referenceDay: 31, referenceMonth: 7, allowed: false },
        { referenceDay: 1, referenceMonth: 8, allowed: true },
        { referenceDay: 2, referenceMonth: 8, allowed: true }
      ])(
        'rechecks the current reference date before submission ($referenceMonth/$referenceDay, allowed=$allowed)',
        ({ referenceDay, referenceMonth, allowed }) => {
          const read = new Subject<any>();
          if (readKind === 'detail') loansService.getLoanAccountDetails.mockReturnValue(read);
          else loansService.getLoanApprovalTemplate.mockReturnValue(read);
          component.toggleSelection(page.pageItems[0], true);
          runBatch();
          expect(loansService.loanActionButtons).not.toHaveBeenCalled();

          (TestBed.inject(SettingsService) as any).businessDate = new Date(2026, referenceMonth, referenceDay);
          fixture.detectChanges();
          read.next(readKind === 'detail' ? validLoanDetail() : validApprovalTemplate());
          read.complete();

          expect(loansService.loanActionButtons).toHaveBeenCalledTimes(allowed ? 1 : 0);
          expect(component.batchOutcomes[0].outcome).toBe(allowed ? 'succeeded' : 'failed');
          expect(component.batchOutcomes[0].safeToRetry).toBe(!allowed);
        }
      );
    });

    it.each([
      0,
      503
    ])('classifies detail GET failure %s as failed and safe to retry without a command', (status) => {
      loansService.getLoanAccountDetails.mockReturnValue(throwError(() => ({ status })));
      component.toggleSelection(page.pageItems[0], true);
      runBatch();
      expect(component.batchOutcomes).toEqual([
        { application: page.pageItems[0], outcome: 'failed', safeToRetry: true, reason: 'credits.preflightUnavailable' }
      ]);
      expect(loansService.loanActionButtons).not.toHaveBeenCalled();
      expect(loansService.getLoanAccountDetails).toHaveBeenCalledTimes(1);
      expect(component.busy).toBe(false);
    });

    it.each([
      0,
      503,
      408
    ])('reserves uncertainty for submitted command failure %s', (status) => {
      loansService.loanActionButtons.mockReturnValue(throwError(() => ({ status })));
      component.toggleSelection(page.pageItems[0], true);
      runBatch();
      expect(component.batchOutcomes).toEqual([
        { application: page.pageItems[0], outcome: 'uncertain', safeToRetry: false }
      ]);
      expect(loansService.loanActionButtons).toHaveBeenCalledTimes(1);
    });

    it('preserves completed results and processes remaining applications after synchronous and asynchronous read failures', () => {
      const detail = loansService.getLoanAccountDetails.getMockImplementation();
      loansService.getLoanAccountDetails.mockImplementation((id) => {
        if (id === '43') throw new Error('Detail setup failed');
        if (id === '44') return throwError(() => ({ status: 503 }));
        return detail(id);
      });
      loansService.loanActionButtons.mockImplementation((id) =>
        id === 45 ? throwError(() => ({ status: 0 })) : of({ resourceId: id })
      );
      const applications = [
        42,
        43,
        44,
        45
      ].map((loanId) => ({ ...page.pageItems[0], loanId }));
      applications.forEach((application) => component.toggleSelection(application, true));
      runBatch();
      expect(component.batchOutcomes).toEqual([
        { application: applications[0], outcome: 'succeeded', safeToRetry: false },
        { application: applications[1], outcome: 'failed', safeToRetry: true, reason: 'credits.preflightUnavailable' },
        { application: applications[2], outcome: 'failed', safeToRetry: true, reason: 'credits.preflightUnavailable' },
        { application: applications[3], outcome: 'uncertain', safeToRetry: false }
      ]);
      expect(loansService.loanActionButtons.mock.calls.map(([id]) => id)).toEqual([
        42,
        45
      ]);
      expect(component.selectedApplicationIds.size).toBe(0);
      expect(component.busy).toBe(false);
    });
  });

  it.each([
    0,
    503
  ])('classifies approval-template GET failure %s as failed without losing completed approvals', (status) => {
    authenticationService.getCredentials.mockReturnValue({ permissions: ['APPROVE_LOAN'] } as any);
    loansService.getLoanApprovalTemplate
      .mockReturnValueOnce(
        of({ approvalAmount: '1200', expectedDisbursementDate: [
            2026,
            9,
            30
          ] })
      )
      .mockReturnValueOnce(throwError(() => ({ status })));
    const applications = [
      42,
      43
    ].map((loanId) => ({ ...page.pageItems[0], loanId }));
    applications.forEach((application) => component.toggleSelection(application, true));
    component.massApprove();
    expect(component.batchOutcomes).toEqual([
      { application: applications[0], outcome: 'succeeded', safeToRetry: false },
      { application: applications[1], outcome: 'failed', safeToRetry: true, reason: 'credits.preflightUnavailable' }
    ]);
    expect(loansService.loanActionButtons).toHaveBeenCalledTimes(1);
  });

  it('keeps working-capital detail GET failures safe to retry without a rejection command', () => {
    loansService.getWorkingCapitalLoanDetails.mockReturnValue(throwError(() => ({ status: 0 })));
    const application = { ...page.pageItems[0], productType: 'working-capital' };
    component.toggleSelection(application, true);
    component.massReject();
    expect(component.batchOutcomes).toEqual([
      { application, outcome: 'failed', safeToRetry: true, reason: 'credits.preflightUnavailable' }
    ]);
    expect(loansService.applyWorkingCapitalLoanAccountCommand).not.toHaveBeenCalled();
  });
  it.each([
    { name: 'queued only', outcomes: ['queued'], banner: '' },
    { name: 'succeeded and queued', outcomes: [
        'succeeded',
        'queued'
      ], banner: '' },
    { name: 'failed and queued', outcomes: [
        'failed',
        'queued'
      ], banner: 'error' },
    { name: 'uncertain and queued', outcomes: [
        'uncertain',
        'queued'
      ], banner: 'error' },
    { name: 'succeeded only', outcomes: ['succeeded'], banner: 'success' }
  ])('uses the appropriate approval banner for $name', ({ outcomes, banner }) => {
    authenticationService.getCredentials.mockReturnValue({ permissions: ['APPROVE_LOAN'] } as any);
    loansService.loanActionButtons.mockImplementation((id) => {
      const outcome = outcomes[Number(id) - 42];
      if (outcome === 'queued') return of({ commandId: 77 });
      if (outcome === 'failed') return throwError(() => ({ status: 400 }));
      if (outcome === 'uncertain') return throwError(() => ({ status: 0 }));
      return of({ resourceId: id });
    });
    outcomes.forEach((_outcome, index) =>
      component.toggleSelection({ ...page.pageItems[0], loanId: index + 42 }, true)
    );

    component.massApprove();
    fixture.detectChanges();

    expect(component.batchOutcomes.map((result) => result.outcome)).toEqual(outcomes);
    expect(component.rejectionResultType).toBe(banner);
    const alert = fixture.nativeElement.querySelector('div.alert');
    expect(alert.classList.contains('error')).toBe(banner === 'error');
    if (banner === '') expect(alert.querySelector('.fa-check-circle')).toBeNull();
  });

  describe('reactive local-day fallback', () => {
    beforeEach(() => {
      jest.useFakeTimers();
      jest.setSystemTime(new Date(2026, 8, 8, 23, 59, 59));
      tasksService.getCreditApplications.mockImplementation((params: any) =>
        of({ ...page, totalFilteredRecords: params.submittedTo === '2026-08-29' ? 1 : 0 })
      );
      component.retrySummary();
    });
    afterEach(() => {
      fixture.destroy();
      jest.useRealTimers();
    });

    it.each([
      null,
      new Date(NaN)
    ])(
      'updates both overdue rows and summary cutoffs at midnight without a valid business date (%s)',
      (businessDate) => {
        (TestBed.inject(SettingsService) as any).businessDate = businessDate;
        fixture.detectChanges();
        const application = { ...page.pageItems[0], submittedOnDate: [
            2026,
            8,
            29
          ] };
        expect(component.referenceDate).toEqual(new Date(2026, 8, 8));
        expect(component.isOverdue(application)).toBe(false);
        expect(component.overduePendingCount).toBe(0);
        tasksService.getCreditApplications.mockClear();

        jest.advanceTimersByTime(1000);
        fixture.detectChanges();

        expect(component.referenceDate).toEqual(new Date(2026, 8, 9));
        expect(component.isOverdue(application)).toBe(true);
        expect(component.overduePendingCount).toBe(1);
        expect(tasksService.getCreditApplications).toHaveBeenCalledWith(
          expect.objectContaining({ status: 100, submittedTo: '2026-08-29' })
        );
        expect(tasksService.getCreditApplications.mock.calls.every(([params]) => params.limit === 1)).toBe(true);
      }
    );

    it.each([
      'visibilitychange',
      'focus',
      'pageshow'
    ])('updates the same local reference day on %s after timers were suspended', (event) => {
      (TestBed.inject(SettingsService) as any).businessDate = null;
      fixture.detectChanges();
      tasksService.getCreditApplications.mockClear();
      const visibility = jest.spyOn(document, 'hidden', 'get').mockReturnValue(false);
      try {
        jest.setSystemTime(new Date(2026, 8, 11, 10));
        (event === 'visibilitychange' ? document : window).dispatchEvent(new Event(event));
        fixture.detectChanges();

        expect(component.referenceDate).toEqual(new Date(2026, 8, 11));
        expect(
          component.isOverdue({ ...page.pageItems[0], submittedOnDate: [
              2026,
              8,
              31
            ] })
        ).toBe(true);
        expect(tasksService.getCreditApplications).toHaveBeenCalledWith(
          expect.objectContaining({ status: 100, submittedTo: '2026-08-31' })
        );
        expect(tasksService.getCreditApplications.mock.calls.every(([params]) => params.limit === 1)).toBe(true);
      } finally {
        visibility.mockRestore();
      }
    });

    it('does not refresh summaries when the app resumes on the same local day', () => {
      (TestBed.inject(SettingsService) as any).businessDate = null;
      fixture.detectChanges();
      tasksService.getCreditApplications.mockClear();
      window.dispatchEvent(new Event('focus'));
      fixture.detectChanges();
      expect(tasksService.getCreditApplications).not.toHaveBeenCalled();
    });

    it('stops fallback updates when a valid business date becomes available', () => {
      (TestBed.inject(SettingsService) as any).businessDate = null;
      fixture.detectChanges();
      (TestBed.inject(SettingsService) as any).businessDate = new Date(2026, 8, 7);
      fixture.detectChanges();
      tasksService.getCreditApplications.mockClear();

      jest.advanceTimersByTime(1000);
      window.dispatchEvent(new Event('focus'));
      fixture.detectChanges();

      expect(component.referenceDate).toEqual(new Date(2026, 8, 7));
      expect(tasksService.getCreditApplications).not.toHaveBeenCalled();
    });

    it('removes the fallback timer and resume listeners when the component is destroyed', () => {
      (TestBed.inject(SettingsService) as any).businessDate = null;
      fixture.detectChanges();
      const day = component.referenceDate;
      fixture.destroy();
      tasksService.getCreditApplications.mockClear();

      jest.advanceTimersByTime(1000);
      window.dispatchEvent(new Event('focus'));
      document.dispatchEvent(new Event('visibilitychange'));

      expect(component.referenceDate).toBe(day);
      expect(tasksService.getCreditApplications).not.toHaveBeenCalled();
    });
  });
  it.each([
    { flag: 'multiDisburseLoan', reason: 'credits.multiDisbursementReview' },
    { flag: 'isTopup', reason: 'credits.topUpReview' },
    { flag: 'isLoanProductLinkedToFloatingRate', reason: 'credits.floatingRateReview' },
    { flag: 'discountAmount', reason: 'credits.discountedReview' }
  ])('explains $flag approval refusals as not submitted with an individual-review action', ({ flag, reason }) => {
    authenticationService.getCredentials.mockReturnValue({ permissions: ['APPROVE_LOAN'] } as any);
    const detail: any = validLoanDetail();
    const template = validApprovalTemplate();
    if (flag === 'discountAmount') template.discountAmount = 0;
    else detail[flag] = true;
    loansService.getLoanAccountDetails.mockReturnValue(of(detail));
    loansService.getLoanApprovalTemplate.mockReturnValue(of(template));
    component.toggleSelection(page.pageItems[0], true);

    component.massApprove();
    fixture.detectChanges();

    expect(loansService.loanActionButtons).not.toHaveBeenCalled();
    expect(component.batchOutcomes[0]).toMatchObject({ outcome: 'failed', safeToRetry: true, reason });
    const result = fixture.nativeElement.querySelector('.batch-outcomes').textContent;
    expect(result).toContain('credits.notSubmitted');
    expect(result).toContain(reason);
    expect(result).not.toContain('credits.failed');
  });

  it('explains changed approval data and failed verification reads separately', () => {
    authenticationService.getCredentials.mockReturnValue({ permissions: ['APPROVE_LOAN'] } as any);
    const detail = validLoanDetail();
    detail.principal = '1201';
    loansService.getLoanAccountDetails
      .mockReturnValueOnce(of(detail))
      .mockReturnValueOnce(throwError(() => ({ status: 503 })));
    component.toggleSelection(page.pageItems[0], true);
    component.toggleSelection({ ...page.pageItems[0], loanId: 43 }, true);

    component.massApprove();
    fixture.detectChanges();

    expect(loansService.loanActionButtons).not.toHaveBeenCalled();
    expect(component.batchOutcomes.map((result) => result.reason)).toEqual([
      'credits.approvalDataChanged',
      'credits.preflightUnavailable'
    ]);
    expect(fixture.nativeElement.querySelector('.batch-outcomes').textContent).toContain(
      'credits.preflightUnavailable'
    );
  });

  it('shows the pre-submission reason on the separate Mass Rejection page', () => {
    TestBed.resetTestingModule();
    createComponent(of(page), ['REJECT_LOAN'], 'mass-rejection');
    const detail = validLoanDetail();
    detail.status.id = 300;
    loansService.getLoanAccountDetails.mockReturnValue(of(detail));
    component.toggleSelection(page.pageItems[0], true);

    component.rejectionForm.patchValue({ reason: 'documentation', rejectedOnDate: new Date(2026, 8, 1) });
    component.massReject();
    fixture.detectChanges();

    expect(loansService.getLoanAccountDetails).toHaveBeenCalled();
    expect(loansService.loanActionButtons).not.toHaveBeenCalled();
    expect(component.batchOutcomes[0].reason).toBe('massRejection.changed');
    expect(fixture.nativeElement.querySelector('.batch-outcomes').textContent).toContain('credits.notSubmitted');
    expect(fixture.nativeElement.querySelector('.rejection-panel')).not.toBeNull();
  });

  describe.each([
    'approve',
    'reject'
  ] as const)('%s maker-checker results', (operation) => {
    it.each([
      { response: { commandId: 77, resourceId: 42, rollbackTransaction: true }, expected: 'queued' },
      { response: { resourceId: 42, rollbackTransaction: true }, expected: 'queued' },
      { response: { commandId: 77, resourceId: 43, rollbackTransaction: true }, expected: 'uncertain' },
      { response: { resourceId: 42, rollbackTransaction: false }, expected: 'succeeded' }
    ])('uses $expected for an identity-checked command response', ({ response, expected }) => {
      authenticationService.getCredentials.mockReturnValue({ permissions: [
          'APPROVE_LOAN',
          'REJECT_LOAN'
        ] } as any);
      loansService.loanActionButtons.mockReturnValue(of(response));
      component.toggleSelection(page.pageItems[0], true);

      if (operation === 'approve') component.massApprove();
      else component.massReject();
      fixture.detectChanges();

      expect(component.batchOutcomes[0]).toMatchObject({ outcome: expected, safeToRetry: false });
      if (expected === 'queued') {
        expect(component.rejectionResultType).toBe('');
        expect(fixture.nativeElement.querySelector('.batch-outcomes').textContent).toContain('credits.queued');
        expect(fixture.nativeElement.querySelector('.batch-outcomes').textContent).not.toContain(
          'credits.notSubmitted'
        );
      }
    });
  });

  describe('WEB-1476 inline rejection', () => {
    let current: any[];
    let savedNotes: Map<string, string>;
    function mass(rows: any[] = page.pageItems) {
      TestBed.resetTestingModule();
      const storage = new Map<string, string>();
      (localStorage.getItem as jest.Mock).mockImplementation((key) => storage.get(key) ?? null);
      (localStorage.setItem as jest.Mock).mockImplementation((key, value) => storage.set(key, value));
      (localStorage.removeItem as jest.Mock).mockImplementation((key) => storage.delete(key));
      (localStorage.clear as jest.Mock).mockImplementation(() => storage.clear());
      localStorage.clear();
      current = rows.map((row) => ({ ...row, amount: String(row.amount) }));
      savedNotes = new Map();
      createComponent(
        (params) => {
          const filtered = current.filter((row) => !params.status || row.status.id === params.status);
          return of({
            totalFilteredRecords: filtered.length,
            pageItems: filtered.slice(params.offset, params.offset + params.limit)
          });
        },
        ['REJECT_LOAN'],
        'mass-rejection'
      );
      const detail = (id: string) => {
        const row = current.find((item) => String(item.loanId) === String(id));
        return of({
          id: row.loanId,
          clientId: row.clientId,
          loanProductId: row.productId,
          proposedPrincipal: row.amount,
          currency: { code: row.currencyCode, decimalPlaces: row.currencyCode === 'JPY' ? 0 : 2 },
          accountNo: row.accountNo,
          status: row.status,
          timeline: { submittedOnDate: row.submittedOnDate }
        });
      };
      loansService.getLoanAccountDetails = jest.fn(detail);
      loansService.getWorkingCapitalLoanDetails = jest.fn(detail);
      loansService.getLoanNotes = jest.fn((id) => of([{ note: savedNotes.get(String(id)) }]));
      const command = (id: any, _operation: any, payload: any) => {
        current.find((row) => String(row.loanId) === String(id)).status = { id: 500 };
        savedNotes.set(String(id), payload.note);
        return of({ resourceId: id });
      };
      loansService.loanActionButtons.mockImplementation(command);
      loansService.applyWorkingCapitalLoanAccountCommand.mockImplementation(command);
      component.rejectionForm.patchValue({ reason: 'documentation' });
    }
    afterEach(() => localStorage.clear());

    it('excludes all nonpending, unsupported and unknown rows from Select All and explains disabled rows', () => {
      mass(
        [
          100,
          200,
          300,
          500,
          999
        ]
          .map((status, index) => ({ ...page.pageItems[0], loanId: index + 1, status: { id: status } }))
          .concat([
            { ...page.pageItems[0], loanId: 6, productType: 'savings' }
          ])
      );
      component.toggleVisibleSelection(true);
      expect([...component.selectedApplicationIds]).toEqual([1]);
      expect(current.slice(1, 4).map((row) => component.disabledReason(row))).toEqual([
        'massRejection.approved',
        'massRejection.active',
        'massRejection.rejected'
      ]);
      expect(component.rejectableCount).toBe(1);
    });

    it('filters out unsupported pending products without inventing their eligibility', () => {
      mass([
        { ...page.pageItems[0] },
        { ...page.pageItems[0], loanId: 43, productType: 'unknown' }
      ]);
      component.toggleRejectableOnly(true);
      expect(component.dataSource.data.map((row) => row.loanId)).toEqual([42]);
      expect(component.totalFilteredRecords).toBe(2);
      expect(component.rejectableCount).toBe(1);
      expect(component.scopeTotal).toBe(2);
    });

    it('keeps an incomplete eligible count unknown and never requests more than 200 records', () => {
      mass();
      tasksService.getCreditApplications.mockReturnValue(of({ totalFilteredRecords: 201, pageItems: current }));
      component.retryLoad();
      expect(component.rejectableCount).toBeNull();
      expect(tasksService.getCreditApplications.mock.calls.every(([params]) => params.limit <= 200)).toBe(true);
    });

    it('updates selection, table state and exact totals immediately on removal, keeping currencies separate', () => {
      mass([
        { ...page.pageItems[0], amount: '0.10' },
        { ...page.pageItems[0], loanId: 43, amount: '0.20' },
        { ...page.pageItems[0], loanId: 44, currencyCode: 'JPY', amount: '123' }
      ]);
      component.currencyOptions.push({ code: 'JPY', name: 'Yen', decimalPlaces: 0 });
      component.toggleVisibleSelection(true);
      expect(component.selectedTotals).toEqual([
        { code: 'USD', digits: 2, amount: '0.30' },
        { code: 'JPY', digits: 0, amount: '123' }
      ]);
      component.removeSelected(current[0]);
      expect(component.selectedApplicationIds.size).toBe(2);
      expect(component.isSelected(current[0])).toBe(false);
      expect(component.selectedTotals![0].amount).toBe('0.20');
    });

    it('requires a reason, accepts an optional note, validates combined length and never silently truncates', () => {
      mass();
      component.toggleVisibleSelection(true);
      expect(component.canRejectSelection).toBe(true);
      component.rejectionForm.patchValue({ reason: '' });
      expect(component.canRejectSelection).toBe(false);
      component.rejectionForm.patchValue({ reason: 'custom', customReason: '  ' });
      expect(component.canRejectSelection).toBe(false);
      component.rejectionForm.patchValue({ customReason: 'Custom decision', note: 'x'.repeat(1000) });
      expect(component.rejectionNote.length).toBeGreaterThan(1000);
      expect(component.canRejectSelection).toBe(false);
      expect(component.rejectionForm.controls.note.value).toHaveLength(1000);
      component.rejectionForm.patchValue({ note: '' });
      expect(component.canRejectSelection).toBe(true);
      component.rejectionForm.patchValue({ customReason: 'x'.repeat(1001) });
      expect(component.canRejectSelection).toBe(false);
      component.rejectionForm.patchValue({ reason: 'documentation' });
      expect(component.canRejectSelection).toBe(true);
      expect(component.rejectionForm.controls.customReason.value).toHaveLength(1001);
    });

    it('defaults to business date and rejects invalid, future, missing and pre-submission dates', () => {
      mass();
      component.toggleVisibleSelection(true);
      expect(component.rejectionForm.controls.rejectedOnDate.value).toEqual(new Date(2026, 8, 8));
      for (const date of [
        null,
        new Date('invalid'),
        new Date(2027, 0, 1),
        new Date(2025, 0, 1)
      ]) {
        component.rejectionForm.patchValue({ rejectedOnDate: date });
        expect(component.canRejectSelection).toBe(false);
      }
      component.rejectionForm.patchValue({ rejectedOnDate: new Date(2026, 8, 8) });
      expect(component.canRejectSelection).toBe(true);
    });

    it('sends no commands before confirmation, freezes the reviewed data, and preserves selection on cancel', () => {
      mass();
      component.toggleVisibleSelection(true);
      const confirmation = new Subject<any>();
      dialog.open.mockReturnValue({ afterClosed: () => confirmation } as any);
      component.massReject();
      expect(component.rejectionForm.disabled).toBe(true);
      expect(loansService.loanActionButtons).not.toHaveBeenCalled();
      component.removeSelected(current[0]);
      expect(component.selectedApplicationIds.size).toBe(1);
      confirmation.next({ confirm: false });
      expect(component.rejectionForm.enabled).toBe(true);
      expect(component.selectedApplicationIds.size).toBe(1);
      expect(loansService.loanActionButtons).not.toHaveBeenCalled();
    });

    it('persists reason and optional note using only supported fields and verifies them by readback', () => {
      mass();
      component.toggleVisibleSelection(true);
      component.rejectionForm.patchValue({ note: 'Missing signed authorization' });
      const expectedNote = component.rejectionNote;
      component.massReject();
      expect(loansService.loanActionButtons).toHaveBeenCalledWith(42, 'reject', {
        rejectedOnDate: '2026-09-08',
        note: expectedNote,
        dateFormat: 'dd MMMM yyyy',
        locale: 'en'
      });
      expect(savedNotes.get('42')).toBe(expectedNote);
      expect(loansService.getLoanNotes).toHaveBeenCalledWith('42');
      expect(component.batchOutcomes[0].outcome).toBe('succeeded');
      expect(component.selectedApplicationIds.size).toBe(0);
      expect(component.rejectableCount).toBe(0);
    });

    it('uses working-capital detail and command paths and reconciles the resulting status', () => {
      mass([{ ...page.pageItems[0], productType: 'working-capital' }]);
      component.toggleVisibleSelection(true);
      component.massReject();
      expect(loansService.applyWorkingCapitalLoanAccountCommand).toHaveBeenCalledTimes(1);
      expect(loansService.getWorkingCapitalLoanDetails).toHaveBeenCalledTimes(2);
      expect(loansService.loanActionButtons).not.toHaveBeenCalled();
      expect(component.batchOutcomes[0].outcome).toBe('succeeded');
    });

    it.each([
      { loanProductId: 999 },
      { proposedPrincipal: '1200.01' },
      { currency: { code: 'MXN', decimalPlaces: 2 } }
    ])('blocks changed financial review data before any write: %s', (patch) => {
      mass();
      component.toggleVisibleSelection(true);
      loansService.getLoanAccountDetails.mockReturnValue(
        of({
          id: 42,
          accountNo: 'LN-42',
          status: { id: 100 },
          loanProductId: 10,
          proposedPrincipal: '1200',
          currency: { code: 'USD', decimalPlaces: 2 },
          timeline: { submittedOnDate: page.pageItems[0].submittedOnDate },
          ...patch
        })
      );
      component.massReject();
      expect(loansService.loanActionButtons).not.toHaveBeenCalled();
      expect(component.batchOutcomes[0]).toMatchObject({ outcome: 'failed', reason: 'massRejection.changed' });
    });

    it('keeps selection and snapshotted command routing fixed when product metadata arrives during confirmation', () => {
      const row: any = { ...page.pageItems[0] };
      delete row.productType;
      mass([row]);
      component.toggleVisibleSelection(true);
      const confirmation = new Subject<any>();
      dialog.open.mockReturnValue({ afterClosed: () => confirmation } as any);
      component.massReject();
      const products = new Subject<any>();
      productsService.getLoanProductsBasicDetails.mockReturnValue(products);
      (component as any).loadFilterOptions();
      products.next([{ id: 10, name: 'Term Loan', productType: 'working-capital' }]);
      products.complete();
      expect(component.selectedApplicationIds.size).toBe(1);
      confirmation.next({ confirm: true });
      expect(loansService.loanActionButtons).toHaveBeenCalledTimes(1);
      expect(loansService.applyWorkingCapitalLoanAccountCommand).not.toHaveBeenCalled();
    });

    it('keeps the existing concurrency bound of three rejection requests', () => {
      mass(Array.from({ length: 5 }, (_, index) => ({ ...page.pageItems[0], loanId: 42 + index })));
      const responses = Array.from({ length: 5 }, () => new Subject<any>());
      loansService.loanActionButtons.mockImplementation((id: any) => responses[id - 42]);
      component.toggleVisibleSelection(true);
      component.massReject();
      expect(loansService.loanActionButtons).toHaveBeenCalledTimes(3);
      responses[0].error({ status: 400 });
      expect(loansService.loanActionButtons).toHaveBeenCalledTimes(4);
      responses[1].error({ status: 400 });
      expect(loansService.loanActionButtons).toHaveBeenCalledTimes(5);
      responses.slice(2).forEach((response) => response.error({ status: 400 }));
      expect(component.rejecting).toBe(false);
      expect(component.batchOutcomes).toHaveLength(5);
    });

    it('prevents stale status or permission changes from sending rejection commands', () => {
      mass();
      component.toggleVisibleSelection(true);
      loansService.getLoanAccountDetails.mockReturnValue(of({ id: 42, accountNo: 'LN-42', status: { id: 200 } }));
      component.massReject();
      expect(loansService.loanActionButtons).not.toHaveBeenCalled();
      expect(component.batchOutcomes[0].outcome).toBe('failed');
      component.toggleVisibleSelection(true);
      authenticationService.getCredentials.mockReturnValue({ permissions: ['APPROVE_LOAN'] } as any);
      expect(component.canSelect(current[0])).toBe(false);
      component.massReject();
      expect(loansService.loanActionButtons).not.toHaveBeenCalled();
    });

    it('prevents duplicate submissions and navigation-driven selection changes while processing', () => {
      mass();
      component.toggleVisibleSelection(true);
      const response = new Subject<any>();
      loansService.loanActionButtons.mockReturnValue(response);
      component.massReject();
      component.massReject();
      component.clearFilters();
      expect(loansService.loanActionButtons).toHaveBeenCalledTimes(1);
      expect(component.rejecting).toBe(true);
      expect(component.rejectionForm.disabled).toBe(true);
      response.error({ status: 0 });
      expect(component.batchOutcomes[0].outcome).toBe('uncertain');
      expect(component.canSelect(current[0])).toBe(false);
    });

    it('distinguishes partial failure, network uncertainty, queued commands and missing note readback', () => {
      mass(
        [
          0,
          1,
          2,
          3,
          4
        ].map((index) => ({ ...page.pageItems[0], loanId: 42 + index }))
      );
      const realCommand = loansService.loanActionButtons.getMockImplementation()!;
      loansService.loanActionButtons.mockImplementation((id: any, op: any, payload: any) =>
        id === 43
          ? throwError(() => ({ status: 400 }))
          : id === 44
            ? throwError(() => ({ status: 503 }))
            : id === 45
              ? of({ commandId: 3 })
              : realCommand(id, op, payload)
      );
      loansService.getLoanNotes.mockImplementation((id) =>
        of([{ note: id === '46' ? 'missing' : savedNotes.get(id) }])
      );
      component.toggleVisibleSelection(true);
      component.massReject();
      expect(component.batchOutcomes.map((row) => row.outcome)).toEqual([
        'succeeded',
        'failed',
        'uncertain',
        'queued',
        'uncertain'
      ]);
      expect(component.rejectionResultMessage).toBe('credits.uncertainResult');
      expect(component.canSelect(current[1])).toBe(true);
      expect(component.canSelect(current[2])).toBe(false);
      expect(component.canSelect(current[3])).toBe(false);
    });

    it('treats readback errors after accepted commands as uncertain, including 403 responses', () => {
      mass();
      component.toggleVisibleSelection(true);
      loansService.getLoanNotes.mockReturnValue(throwError(() => ({ status: 403 })));
      component.massReject();
      expect(component.batchOutcomes[0].outcome).toBe('uncertain');
    });

    it('debounces page search, cancels stale client lookups and clears incompatible selection', fakeAsync(() => {
      mass();
      component.toggleVisibleSelection(true);
      component.creditApplicationsForm.controls.pageSearch.setValue('no match');
      tick(300);
      expect(component.dataSource.data).toHaveLength(0);
      expect(component.selectedApplicationIds.size).toBe(0);
      component.creditApplicationsForm.controls.pageSearch.setValue('LN-42');
      tick(300);
      expect(component.dataSource.data).toHaveLength(1);
    }));
  });
  it.each([
    {
      name: 'changed client',
      rowClient: 1,
      rowGroup: undefined,
      detailClient: 2,
      detailGroup: undefined,
      allowed: false
    },
    {
      name: 'matching group',
      rowClient: undefined,
      rowGroup: 7,
      detailClient: undefined,
      detailGroup: 7,
      allowed: true
    },
    {
      name: 'changed group',
      rowClient: undefined,
      rowGroup: 7,
      detailClient: undefined,
      detailGroup: 8,
      allowed: false
    },
    {
      name: 'missing selected identity',
      rowClient: undefined,
      rowGroup: undefined,
      detailClient: 1,
      detailGroup: undefined,
      allowed: false
    }
  ])(
    'verifies the selected customer identity before approval: $name',
    ({ rowClient, rowGroup, detailClient, detailGroup, allowed }) => {
      authenticationService.getCredentials.mockReturnValue({ permissions: ['APPROVE_LOAN'] } as any);
      const row = { ...page.pageItems[0], clientId: rowClient, groupId: rowGroup };
      const detail: any = {
        ...validLoanDetail(row),
        clientId: detailClient,
        group: detailGroup == null ? undefined : { id: detailGroup },
        loanType: { id: detailGroup == null ? 1 : 2 }
      };
      loansService.getLoanAccountDetails.mockReturnValue(of(detail));
      component.toggleSelection(row, true);

      component.massApprove();

      expect(loansService.getLoanAccountDetails).toHaveBeenCalledWith('42', true);
      expect(loansService.getLoanApprovalTemplate).toHaveBeenCalledWith('42', true);
      expect(loansService.loanActionButtons).toHaveBeenCalledTimes(allowed ? 1 : 0);
      expect(component.batchOutcomes[0].outcome).toBe(allowed ? 'succeeded' : 'failed');
      if (!allowed) expect(component.batchOutcomes[0].reason).toBe('credits.approvalDataChanged');
    }
  );

  it('refuses working-capital approvals when metadata changes before a queued item starts', () => {
    authenticationService.getCredentials.mockReturnValue({ permissions: ['APPROVE_LOAN'] } as any);
    component.loanProductOptions.find((product) => product.id === 9).productType = 'loan';
    const command = new Subject<any>();
    loansService.loanActionButtons.mockImplementation((id) => command.pipe(map(() => ({ resourceId: id }))));
    [
      42,
      43,
      44
    ].forEach((loanId) => component.toggleSelection({ ...page.pageItems[0], loanId }, true));
    component.toggleSelection({ ...page.pageItems[0], loanId: 45, productId: 9, productType: undefined }, true);
    component.massApprove();
    expect(loansService.loanActionButtons).toHaveBeenCalledTimes(3);

    component.loanProductOptions.find((product) => product.id === 9).productType = 'working-capital';
    command.next({});
    command.complete();

    expect(loansService.getLoanApprovalTemplate).not.toHaveBeenCalledWith('45', expect.anything());
    expect(loansService.getWorkingCapitalLoanDetails).not.toHaveBeenCalled();
    expect(loansService.applyWorkingCapitalLoanAccountCommand).not.toHaveBeenCalled();
    expect(loansService.loanActionButtons).toHaveBeenCalledTimes(3);
    expect(component.batchOutcomes.find((result) => result.application.loanId === 45)).toMatchObject({
      outcome: 'failed',
      safeToRetry: true,
      reason: 'credits.approvalLimit'
    });
  });

  it('leaves selection and local search unchanged for invalid pagination events', () => {
    component.toggleSelection(page.pageItems[0], true);
    component.creditApplicationsForm.controls.pageSearch.setValue('Alex', { emitEvent: false });
    component.pageIndex = 1;
    tasksService.getCreditApplications.mockClear();

    component.changePaging({ pageIndex: 0, pageSize: 201 } as any);
    component.changePaging({ pageIndex: -1, pageSize: 25 } as any);

    expect(component.selectedApplicationIds.has(42)).toBe(true);
    expect(component.creditApplicationsForm.controls.pageSearch.value).toBe('Alex');
    expect(component.pageIndex).toBe(1);
    expect(tasksService.getCreditApplications).not.toHaveBeenCalled();
  });
});
