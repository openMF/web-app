/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { FaIconLibrary } from '@fortawesome/angular-fontawesome';
import { faPlus } from '@fortawesome/free-solid-svg-icons';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { TranslateModule } from '@ngx-translate/core';
import { HttpErrorResponse } from '@angular/common/http';
import { Subject, of, throwError } from 'rxjs';
import { SavingProductsComponent } from './saving-products.component';
import { SavingProductListService, SavingsProductList } from './saving-product-list.service';
import { toSavingsProductRow } from './saving-product-list.model';
import { ConfigurationWizardService } from '../../configuration-wizard/configuration-wizard.service';
import { PopoverService } from '../../configuration-wizard/popover/popover.service';
import { AuthenticationService } from '../../core/authentication/authentication.service';
import { environment } from '../../../environments/environment';

const rows = [
  'SIGHT',
  'INTEREST_BEARING_SIGHT',
  'SAVINGS'
].map((classification, index) =>
  toSavingsProductRow(
    { id: index + 1, name: [
        'Main Account',
        'Interest Account',
        'Holiday Savings'
      ][index], nominalAnnualInterestRate: index === 0 ? 0 : 4.5 },
    {
      savingsProductId: index + 1,
      revision: 1,
      status: 'DRAFT',
      operational: false,
      policy: { classification, purpose: 'MAIN', interestMode: 'REFERENCE_RATE' }
    },
    'available'
  )
);
rows.push(
  toSavingsProductRow(
    { id: 4, name: 'Legacy Account' },
    { savingsProductId: 4, revision: null, status: 'UNCONFIGURED', operational: false, policy: null },
    'available'
  )
);

describe('SavingProductsComponent', () => {
  let fixture: ComponentFixture<SavingProductsComponent>;
  let component: SavingProductsComponent;
  let service: { load: jest.Mock };
  let permissions: string[];
  const initialRBAC = environment.productionModeEnableRBAC;

  beforeEach(async () => {
    permissions = ['ALL_FUNCTIONS'];
    environment.productionModeEnableRBAC = true;
    service = { load: jest.fn(() => of({ products: rows, warning: null })) };
    await TestBed.configureTestingModule({ imports: [
        SavingProductsComponent,
        TranslateModule.forRoot()
      ], providers: [
        provideRouter([]),
        provideNoopAnimations(),
        { provide: SavingProductListService, useValue: service },
        { provide: ConfigurationWizardService, useValue: {} },
        { provide: PopoverService, useValue: {} },
        { provide: AuthenticationService, useValue: { getCredentials: () => ({ permissions }) } }
      ] }).compileComponents();
    TestBed.inject(FaIconLibrary).addIcons(faPlus);
    fixture = TestBed.createComponent(SavingProductsComponent);
    component = fixture.componentInstance;
  });
  afterEach(() => {
    fixture.destroy();
    environment.productionModeEnableRBAC = initialRBAC;
  });

  it.each([
    'Main Account',
    'main',
    '  MAIN  '
  ])('searches full catalog by normalized partial name: %s', (search) => {
    fixture.detectChanges();
    component.filters.patchValue({ search });
    expect(component.dataSource.filteredData.map((row) => row.id)).toEqual([1]);
  });
  it.each([
    'SIGHT',
    'INTEREST_BEARING_SIGHT',
    'SAVINGS',
    'UNCLASSIFIED'
  ])('filters %s and combines with search', (classification) => {
    fixture.detectChanges();
    component.filters.patchValue({ classification });
    expect(component.dataSource.filteredData).toHaveLength(1);
    component.filters.patchValue({ search: 'zzzz' });
    expect(component.dataSource.filteredData).toHaveLength(0);
    component.clearFilters();
    expect(component.dataSource.filteredData).toHaveLength(4);
    expect(rows).toHaveLength(4);
  });
  it('searches beyond the visible page and resets pagination when filters change', () => {
    service.load.mockReturnValue(
      of({
        products: Array.from({ length: 15 }, (_, index) =>
          toSavingsProductRow({ id: index + 1, name: `Product ${index + 1}` })
        ),
        warning: null
      })
    );
    fixture.detectChanges();
    const paginator = component.dataSource.paginator!;
    paginator.pageIndex = 1;
    component.filters.patchValue({ search: 'Product 15' });
    expect(component.dataSource.filteredData.map((row) => row.id)).toEqual([15]);
    expect(paginator.pageIndex).toBe(0);
  });
  it('renders loading, filtered empty and dataset empty states', () => {
    const pending = new Subject<SavingsProductList>();
    service.load.mockReturnValue(pending);
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('mat-progress-bar')).toBeTruthy();
    pending.next({ products: rows, warning: null });
    fixture.detectChanges();
    component.filters.patchValue({ search: 'no match' });
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('SavingsProducts.NoMatches');
    service.load.mockReturnValue(of({ products: [], warning: null }));
    component.retry();
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('SavingsProducts.NoProducts');
  });
  it.each([
    403,
    500
  ])('renders core error %s and can retry', (status) => {
    service.load.mockReturnValue(throwError(() => new HttpErrorResponse({ status })));
    fixture.detectChanges();
    expect(component.error).toBe(status === 403 ? 'forbidden' : 'failed');
    expect(fixture.nativeElement.querySelector('[role=alert]')).toBeTruthy();
    service.load.mockReturnValue(of({ products: rows, warning: 'forbidden' }));
    component.retry();
    fixture.detectChanges();
    expect(component.error).toBeNull();
    expect(component.warning).toBe('forbidden');
    expect(fixture.nativeElement.textContent).toContain('SavingsProducts.MetadataDenied');
  });
  it('shows core rates including zero and never presents reference drafts as operational', () => {
    fixture.detectChanges();
    expect(component.interestRate(rows[0])).toBe(0);
    expect(component.interestRate(rows[1])).toBe(4.5);
    expect(component.interestRate(rows[3])).toBeNull();
    expect(fixture.nativeElement.textContent).toContain('SavingsProducts.NoInterest');
    expect(fixture.nativeElement.textContent).not.toContain('CETES');
  });
  it.each([
    true,
    false
  ])('preserves RBAC flag behavior (%s)', (enabled) => {
    environment.productionModeEnableRBAC = enabled;
    permissions = ['READ_SAVINGSPRODUCT'];
    fixture.destroy();
    fixture = TestBed.createComponent(SavingProductsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    const links: HTMLAnchorElement[] = Array.from(fixture.nativeElement.querySelectorAll('a'));
    expect(links.some((link) => link.getAttribute('href') === '/1')).toBe(true);
    expect(links.some((link) => link.getAttribute('href') === '/1/edit')).toBe(!enabled);
    expect(fixture.nativeElement.textContent.includes('labels.text.Create Savings Product')).toBe(!enabled);
  });
  it('links View and Edit to existing supported routes', () => {
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('a[href="/1/edit"]')).toBeTruthy();
    expect(fixture.nativeElement.querySelector('a[href="/1"]')).toBeTruthy();
  });
  it('handles unknown classifications and future statuses without fabricating approval', () => {
    const row = toSavingsProductRow(
      { id: 5, name: 'Unknown' },
      {
        savingsProductId: 5,
        revision: 1,
        status: 'PENDING',
        operational: false,
        policy: { classification: 'FUTURE', purpose: 'NEW' }
      },
      'available'
    );
    expect(row.classification).toBe('UNKNOWN');
    expect(row.policyStatusLabel).toBe('SavingsProducts.NotAvailable');
    expect(row.purposeLabel).toBe('SavingsProducts.UnknownPurpose');
  });
  it('cancels in-flight loading on component destruction', () => {
    const pending = new Subject<SavingsProductList>();
    service.load.mockReturnValue(pending);
    fixture.detectChanges();
    fixture.destroy();
    expect(pending.observed).toBe(false);
  });
});
