/** Angular Imports */
import { Component, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormControl } from '@angular/forms';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';

/** rxjs Imports */
import { startWith, map, debounceTime, distinctUntilChanged, tap } from 'rxjs/operators';

/** Custom Services */
import { AccountingService } from '../../accounting.service';

/**
 * View provisioning entry component.
 */
@Component({
  selector: 'mifosx-view-provisioning-entry',
  templateUrl: './view-provisioning-entry.component.html',
  styleUrls: ['./view-provisioning-entry.component.scss']
})
export class ViewProvisioningEntryComponent implements OnInit, AfterViewInit {

  /** Provisioning entry id. */
  provisioningEntryId: string;
  /** Provisioning entry. */
  provisioningEntry: any;
  /** Provisioning entry entries. */
  provisioningEntryEntries: any;
  /** Office name filter form control. */
  officeName = new FormControl();
  /** Office data. */
  officeData: any;
  /** Filtered office data for autocomplete. */
  filteredOfficeData: any;
  /** Loan product filter form control. */
  loanProduct = new FormControl();
  /** Loan product data. */
  loanProductData: any;
  /** Filtered loan product data for autocomplete. */
  filteredLoanProductData: any;
  /** Provisioning category filter form control. */
  provisioningCategory = new FormControl();
  /** Provisioning category data. */
  provisioningCategoryData: any;
  /** Filtered provisioning category data for autocomplete. */
  filteredProvisioningCategoryData: any;
  /** Columns to be displayed in provisioning entry entries table. */
  displayedColumns: string[] = ['officeName', 'productName', 'currencyCode', 'categoryName', 'amountreserved', 'liabilityAccountName', 'expenseAccountName'];
  /** Data source for provisioning entry entries table. */
  dataSource: MatTableDataSource<any>;
  /** Provisioning entry entries filter. */
  filterValue: any = {
    officeName: '',
    productName: '',
    categoryName: ''
  };

  /** Paginator for provisioning entry entries table. */
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  /** Sorter for provisioning entry entries table. */
  @ViewChild(MatSort, { static: true }) sort: MatSort;

  /**
   * Retrieves the provisioning entry, provisioning entry entries, offices,
   * loan products, provisioning categories data from `resolve`.
   * @param {AccountingService} accountingService Accounting Service.
   * @param {ActivatedRoute} route Activated Route.
   * @param {Router} router Router for navigation.
   */
  constructor(private accountingService: AccountingService,
              private route: ActivatedRoute,
              private router: Router) {
    this.route.data.subscribe((data: {
        provisioningEntry: any,
        provisioningEntryEntries: any,
        offices: any,
        loanProducts: any,
        provisiningCategories: any
      }) => {
        this.provisioningEntryId = data.provisioningEntry.id;
        this.provisioningEntry = data.provisioningEntry;
        this.provisioningEntryEntries = data.provisioningEntryEntries;
        this.officeData = data.offices;
        this.loanProductData = data.loanProducts;
        this.provisioningCategoryData = data.provisiningCategories;
      });
  }

  /**
   * Sets filtered offices, loan products and provisioning categories for autocomplete
   * and provisioning entry entries table.
   */
  ngOnInit() {
    this.setProvisioningEntryEntries();
    this.setFilteredOffices();
    this.setFilteredLoanProducts();
    this.setFilteredProvisioningCategories();
  }

  /**
   * Subscribes to all search filters:
   * Office Name, Loan Product, Provisioning categories.
   */
  ngAfterViewInit() {
    this.officeName.valueChanges
      .pipe(
        map(value => value.toLowerCase()),
        debounceTime(500),
        distinctUntilChanged(),
        tap((filterValue) => {
          this.applyFilter(filterValue, 'officeName');
        })
      )
      .subscribe();

    this.loanProduct.valueChanges
      .pipe(
        map(value => value.toLowerCase()),
        debounceTime(500),
        distinctUntilChanged(),
        tap((filterValue) => {
          this.applyFilter(filterValue, 'productName');
        })
      )
      .subscribe();

    this.provisioningCategory.valueChanges
      .pipe(
        map(value => value.toLowerCase()),
        debounceTime(500),
        distinctUntilChanged(),
        tap((filterValue) => {
          this.applyFilter(filterValue, 'categoryName');
        })
      )
      .subscribe();
  }

  /**
   * Filter predicate for provisioning entry entries table data.
   * @param {any} data Table data.
   * @param {any} filterValue Values to filter data by.
   */
  filterPredicate(data: any, filterValue: any) {
    return data.officeName.toLowerCase().indexOf(filterValue['officeName']) !== -1
      && data.productName.toLowerCase().indexOf(filterValue['productName']) !== -1
      && data.categoryName.toLowerCase().indexOf(filterValue['categoryName']) !== -1;
  }

  /**
   * Initializes the data source, paginator, sorter and filter predicate for
   * provisioning entry entries table.
   */
  setProvisioningEntryEntries() {
    this.dataSource = new MatTableDataSource(this.provisioningEntryEntries.pageItems);
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
    this.dataSource.filterPredicate = this.filterPredicate;
  }

  /**
   * Filters data in provisioning entry entries table based on passed value.
   * @param {string} filterValue Value to filter data.
   * @param {string} property Property to filter data.
   */
  applyFilter(filterValue: string, property: string) {
    this.filterValue[property] = filterValue;
    this.dataSource.filter = this.filterValue;
  }

  /**
   * Sets filtered offices for autocomplete.
   */
  setFilteredOffices() {
    this.filteredOfficeData = this.officeName.valueChanges
    .pipe(
      startWith(''),
      map((office: any) => typeof office === 'string' ? office : office.name),
      map((officeName: string) => officeName ? this.filterOfficeAutocompleteData(officeName) : this.officeData)
    );
  }

  /**
   * Sets filtered loan products for autocomplete.
   */
  setFilteredLoanProducts() {
    this.filteredLoanProductData = this.loanProduct.valueChanges
    .pipe(
      startWith(''),
      map((loanProduct: any) => typeof loanProduct === 'string' ? loanProduct : loanProduct.name),
      map((loanProductName: string) => loanProductName ? this.filterLoanProductAutocompleteData(loanProductName) : this.loanProductData)
    );
  }

  /**
   * Sets filtered provisioning categories for autocomplete.
   */
  setFilteredProvisioningCategories() {
    this.filteredProvisioningCategoryData = this.provisioningCategory.valueChanges
    .pipe(
      startWith(''),
      map((provisioningCategory: any) => typeof provisioningCategory === 'string' ? provisioningCategory : provisioningCategory.categoryName),
      map((provisioningCategoryName: string) => provisioningCategoryName ? this.filterProvisioningCategoryAutocompleteData(provisioningCategoryName) : this.provisioningCategoryData)
    );
  }

  /**
   * Filters offices.
   * @param {string} officeName Office name to filter office by.
   * @returns {any} Filtered offices.
   */
  private filterOfficeAutocompleteData(officeName: string): any {
    return this.officeData.filter((office: any) => office.name.toLowerCase().includes(officeName.toLowerCase()));
  }

  /**
   * Filters loan products.
   * @param {string} loanProductName Loan product name to filter loan products by.
   * @returns {any} Filtered loan products.
   */
  private filterLoanProductAutocompleteData(loanProductName: string): any {
    return this.loanProductData.filter((loanProduct: any) => loanProduct.name.toLowerCase().includes(loanProductName.toLocaleLowerCase()));
  }

  /**
   * Filters provisioning categories.
   * @param {string} provisioningCategoryName Provisioning category name to filter provisioning categories by.
   * @returns {any} Filtered provisioning categories.
   */
  private filterProvisioningCategoryAutocompleteData(provisioningCategoryName: string): any {
    return this.provisioningCategoryData.filter((provisioningCategory: any) => provisioningCategory.categoryName.toLowerCase().includes(provisioningCategoryName.toLocaleLowerCase()));
  }

  /**
   * Creates provisioning journal entries
   * and redirects to created entries.
   */
  createProvisioningJournalEntries() {
    this.accountingService.createProvisioningJournalEntries(this.provisioningEntryId)
      .subscribe((response: any) => {
        this.router.navigate(['../../journal-entries/view', response.resourceId], { relativeTo: this.route });
      });
  }

}
