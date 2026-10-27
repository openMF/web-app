/**
 * Copyright since 2026 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { ActivatedRoute, convertToParamMap, Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { MatDialog } from '@angular/material/dialog';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { BehaviorSubject, of, Subject } from 'rxjs';
import { AlertService } from 'app/core/alert/alert.service';
import { AuthenticationService } from 'app/core/authentication/authentication.service';
import { ErrorHandlerService } from 'app/core/error-handler/error-handler.service';
import { Dates } from 'app/core/utils/dates';
import { LoansService } from 'app/loans/loans.service';
import { LoanProductService } from 'app/products/loan-products/services/loan-product.service';
import { SettingsService } from 'app/settings/settings.service';
import { IconsModule } from 'app/shared/icons.module';
import { SystemService } from 'app/system/system.service';
import en from '../../../assets/translations/en-US.json';
import es from '../../../assets/translations/es-MX.json';
import { LoansViewComponent } from './loans-view.component';

describe('LoansViewComponent', () => {
  const loanDetailsData = {
    loanProductName: 'Test loan',
    status: { active: false, value: 'Submitted and pending approval' },
    currency: { code: 'USD' },
    transactions: [] as any[]
  };

  const loanProductType = { isLoanProduct: true, isWorkingCapital: false };

  let routeData$: BehaviorSubject<any>;
  let datatables$: Subject<any[]>;
  let arrearsConfiguration$: Subject<any>;
  let loansServiceStub: any;
  let systemServiceStub: any;

  /**
   * Builds the component straight from the injection context, without rendering its template: the action menu is
   * assembled in the constructor, so consuming the seeded route data is enough to assert on it.
   *
   * The TestBed is reset on every call because several tests build a component per product type or per flag value.
   * @param productType Which product the LoanProductService stub reports; defaults to a plain loan product.
   * @param url Current router URL; defaults to a client loan route.
   */
  function createComponent(
    productType: { isLoanProduct: boolean; isWorkingCapital: boolean } = loanProductType,
    url = '/clients/1/loans-accounts/1/general'
  ): LoansViewComponent {
    const routeStub = {
      data: routeData$,
      params: new BehaviorSubject({ loanId: '1' }),
      snapshot: {
        params: { loanId: '1' },
        queryParamMap: convertToParamMap({})
      }
    };

    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      providers: [
        { provide: ActivatedRoute, useValue: routeStub },
        { provide: LoansService, useValue: loansServiceStub },
        { provide: SystemService, useValue: systemServiceStub },
        {
          provide: LoanProductService,
          useValue: {
            isLoanProduct: productType.isLoanProduct,
            isWorkingCapital: productType.isWorkingCapital,
            initialize: jest.fn()
          }
        },
        { provide: Router, useValue: { url, navigate: jest.fn() } },
        { provide: TranslateService, useValue: { instant: (key: string) => key } },
        { provide: SettingsService, useValue: {} },
        { provide: ErrorHandlerService, useValue: { handleError: jest.fn() } },
        { provide: MatDialog, useValue: { open: jest.fn() } }
      ]
    });

    return TestBed.runInInjectionContext(() => new LoansViewComponent());
  }

  /**
   * Seeds the resolved route data with an active loan, which is the only status
   * whose action menu carries Prepay Loan and Add Interest Pause.
   */
  function seedActiveLoan(overrides: Record<string, unknown> = {}): void {
    routeData$.next({
      loanDetailsData: {
        ...loanDetailsData,
        status: { active: true, value: 'Active' },
        ...overrides
      }
    });
  }

  /**
   * Flattens the assembled action menu to the button names, which is all these tests assert on.
   * @param component The component whose button configuration to read.
   * @returns The action names in menu order, or an empty list when no menu was built.
   */
  function buttonNames(component: LoansViewComponent): string[] {
    return (component.buttonConfig?.singleButtons ?? []).map((button: { name: string }) => button.name);
  }

  /**
   * Renders the real loan view template so the account holder label can be asserted as the user sees it.
   * @param loan Loan details as returned by the route resolver.
   * @param locale Locale to render, defaulting to English.
   */
  async function createFixture(
    loan: Record<string, unknown>,
    locale = 'en-US'
  ): Promise<ComponentFixture<LoansViewComponent>> {
    localStorage.setItem('mifosXLanguage', JSON.stringify({ code: locale }));

    TestBed.resetTestingModule();
    await TestBed.configureTestingModule({
      imports: [
        LoansViewComponent,
        RouterTestingModule,
        IconsModule,
        NoopAnimationsModule,
        TranslateModule.forRoot()
      ],
      providers: [
        {
          provide: ActivatedRoute,
          useValue: {
            data: new BehaviorSubject({ loanDetailsData: loan }),
            params: new BehaviorSubject({ loanId: '2' }),
            snapshot: { params: { loanId: '2' }, queryParamMap: convertToParamMap({}) }
          }
        },
        {
          provide: LoansService,
          useValue: {
            getLoanDataTables: jest.fn(() => of([])),
            getEntityDataTableChecks: jest.fn(() => of({ pageItems: [] })),
            saveLoanDisbursementDetailsData: jest.fn()
          }
        },
        { provide: SystemService, useValue: { getConfigurationByName: jest.fn(() => of({ value: 0 })) } },
        {
          provide: LoanProductService,
          useValue: {
            isLoanProduct: true,
            isWorkingCapital: false,
            productType: { value: 'loan' },
            initialize: jest.fn()
          }
        },
        {
          provide: SettingsService,
          useValue: { dateFormat: 'dd MMMM yyyy', decimals: 2, language: { code: locale } }
        },
        { provide: ErrorHandlerService, useValue: { handleError: jest.fn() } },
        { provide: MatDialog, useValue: { open: jest.fn() } },
        {
          provide: Dates,
          useValue: { angularToMomentFormat: (format: string) => format, getMomentLocale: () => 'en' }
        },
        { provide: AlertService, useValue: { alert: jest.fn() } },
        {
          provide: AuthenticationService,
          useValue: { getCredentials: jest.fn(() => ({ permissions: ['ALL_FUNCTIONS'] })) }
        }
      ]
    }).compileComponents();

    const translate = TestBed.inject(TranslateService);
    translate.setTranslation('en-US', en);
    translate.setTranslation('es-MX', es);
    translate.use(locale);

    const fixture = TestBed.createComponent(LoansViewComponent);
    fixture.detectChanges();
    await fixture.whenStable();
    return fixture;
  }

  /** Rendered text with template whitespace collapsed, so label assertions are readable. */
  function renderedText(fixture: ComponentFixture<LoansViewComponent>): string {
    return (fixture.nativeElement.textContent as string).replace(/\s+/g, ' ');
  }

  beforeEach(() => {
    routeData$ = new BehaviorSubject({ loanDetailsData });
    datatables$ = new Subject<any[]>();
    arrearsConfiguration$ = new Subject<any>();
    loansServiceStub = {
      getLoanDataTables: jest.fn(() => datatables$),
      getEntityDataTableChecks: jest.fn(() => of({ pageItems: [] })),
      saveLoanDisbursementDetailsData: jest.fn()
    };
    systemServiceStub = {
      getConfigurationByName: jest.fn(() => arrearsConfiguration$)
    };
  });

  it('does not wait for datatables or the arrears configuration before consuming route-resolved loan details', () => {
    const component = createComponent();

    expect(component.loanDetailsData).toEqual(loanDetailsData);
    expect(component.datatablesReady).toBe(false);
    expect(loansServiceStub.getLoanDataTables).toHaveBeenCalledWith('m_loan');
    expect(systemServiceStub.getConfigurationByName).toHaveBeenCalledWith('loan-arrears-delinquency-display-data');
  });

  it('populates deferred datatables and arrears configuration independently when each request completes', () => {
    const component = createComponent();
    const datatables = [{ registeredTableName: 'loan_extra' }];

    arrearsConfiguration$.next({ value: 2 });

    expect(component.loanDisplayArrearsDelinquency).toBe(2);
    expect(component.datatablesReady).toBe(false);

    datatables$.next(datatables);

    expect(component.loanDatatables).toEqual(datatables);
    expect(component.datatablesReady).toBe(true);
  });

  describe('action menu on an active loan', () => {
    it('offers Prepay Loan whether or not the product recalculates interest', () => {
      seedActiveLoan({ isInterestRecalculationEnabled: false });
      expect(buttonNames(createComponent())).toContain('Prepay Loan');

      seedActiveLoan({ isInterestRecalculationEnabled: true });
      expect(buttonNames(createComponent())).toContain('Prepay Loan');
    });

    it('offers Add Interest Pause only when the loan recalculates interest', () => {
      seedActiveLoan({ isInterestRecalculationEnabled: true });
      expect(buttonNames(createComponent())).toContain('Add Interest Pause');

      seedActiveLoan({ isInterestRecalculationEnabled: false });
      expect(buttonNames(createComponent())).not.toContain('Add Interest Pause');
    });

    it('withholds Add Interest Pause when the loan details omit the interest recalculation flag', () => {
      seedActiveLoan();

      expect(buttonNames(createComponent())).not.toContain('Add Interest Pause');
    });

    it('leaves the Working Capital action menu to its own configuration', () => {
      seedActiveLoan({ isInterestRecalculationEnabled: false });

      const names = buttonNames(createComponent({ isLoanProduct: false, isWorkingCapital: true }));

      // Working Capital declares Prepay Loan itself, so it appears exactly once
      // and never picks up the loan-product entry or Add Interest Pause.
      expect(names.filter((name) => name === 'Prepay Loan')).toHaveLength(1);
      expect(names).not.toContain('Add Interest Pause');
    });
  });

  describe('account holder identity', () => {
    it('labels a client loan from the loan details on a standalone route', () => {
      routeData$.next({
        loanDetailsData: {
          ...loanDetailsData,
          clientId: 12,
          clientName: 'Ada Lovelace',
          clientAccountNo: '000000012'
        }
      });

      const component = createComponent(loanProductType, '/loans/2/general');

      expect(component.entityType).toBe('Client');
      expect(component.accountHolderLabelKey).toBe('labels.text.Client');
      expect(component.accountHolderName).toBe('Ada Lovelace');
      expect(component.accountHolderAccountNo).toBe('000000012');
    });

    it('labels a group loan from the loan details', () => {
      routeData$.next({
        loanDetailsData: {
          ...loanDetailsData,
          groupId: 7,
          group: { id: 7, name: 'Solidarity Group', accountNo: '000000007' }
        }
      });

      const component = createComponent(loanProductType, '/loans/2/general');

      expect(component.entityType).toBe('Group');
      expect(component.accountHolderLabelKey).toBe('labels.text.Group');
      expect(component.accountHolderName).toBe('Solidarity Group');
      expect(component.accountHolderAccountNo).toBe('000000007');
    });

    it('prefers the client association for a GLIM loan that also carries a group', () => {
      routeData$.next({
        loanDetailsData: {
          ...loanDetailsData,
          clientId: 12,
          clientName: 'Ada Lovelace',
          clientAccountNo: '000000012',
          groupId: 7,
          group: { id: 7, name: 'Solidarity Group', accountNo: '000000007' }
        }
      });

      const component = createComponent(loanProductType, '/loans/2/general');

      expect(component.entityType).toBe('Client');
      expect(component.accountHolderName).toBe('Ada Lovelace');
      expect(component.accountHolderAccountNo).toBe('000000012');
    });

    it.each([
      '/loans/2/general',
      '/clients/1/loans-accounts/2/general',
      '/centers/1/loans-accounts/2/general'
    ])('falls back to the neutral label when %s has no identifiable holder', (url) => {
      const component = createComponent(loanProductType, url);

      expect(component.entityType).toBeNull();
      expect(component.accountHolderLabelKey).toBe('labels.text.Account holder');
      expect(component.accountHolderLabelKey).not.toBe('labels.text.undefined');
      expect(component.accountHolderName).toBe('');
      expect(component.accountHolderAccountNo).toBe('');
    });

    it('updates the label when the reused component receives another loan', () => {
      routeData$.next({
        loanDetailsData: {
          ...loanDetailsData,
          clientId: 12,
          clientName: 'Ada Lovelace',
          clientAccountNo: '000000012'
        }
      });

      const component = createComponent(loanProductType, '/loans/2/general');
      expect(component.accountHolderLabelKey).toBe('labels.text.Client');

      routeData$.next({
        loanDetailsData: {
          ...loanDetailsData,
          groupId: 7,
          group: { id: 7, name: 'Solidarity Group', accountNo: '000000007' }
        }
      });

      expect(component.accountHolderLabelKey).toBe('labels.text.Group');
      expect(component.accountHolderName).toBe('Solidarity Group');
    });

    it('renders the client label and name on a standalone loan page', async () => {
      const fixture = await createFixture({
        ...loanDetailsData,
        clientId: 12,
        clientName: 'Ada Lovelace',
        clientAccountNo: '000000012'
      });

      const text = renderedText(fixture);
      expect(text).toContain('Client Name:');
      expect(text).toContain('Ada Lovelace');
      expect(text).not.toContain('undefined Name:');
    });

    it('renders the group label and name on a group loan page', async () => {
      const fixture = await createFixture({
        ...loanDetailsData,
        groupId: 7,
        group: { id: 7, name: 'Solidarity Group', accountNo: '000000007' }
      });

      const text = renderedText(fixture);
      expect(text).toContain('Group Name:');
      expect(text).toContain('Solidarity Group');
      expect(text).not.toContain('undefined Name:');
    });

    it('renders the neutral holder label instead of an undefined-derived key', async () => {
      const fixture = await createFixture({ ...loanDetailsData });

      const text = renderedText(fixture);
      expect(text).toContain('Account holder:');
      expect(text).not.toContain('undefined Name:');
      expect(text).not.toContain('labels.text.');
    });

    it('localizes the neutral holder label', async () => {
      const fixture = await createFixture({ ...loanDetailsData }, 'es-MX');

      const text = renderedText(fixture);
      expect(text).toContain('Titular de la cuenta:');
      expect(text).not.toContain('indéfini');
      expect(text).not.toContain('No definido');
    });
  });
});
