import { Component, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { FormControl } from '@angular/forms';
import { MatPaginator, MatSort, MatTableDataSource } from '@angular/material';

import { startWith, map, debounceTime, distinctUntilChanged, tap } from 'rxjs/operators';

import { AccountingService } from '../../accounting.service';

@Component({
  selector: 'mifosx-view-provisioning-entry',
  templateUrl: './view-provisioning-entry.component.html',
  styleUrls: ['./view-provisioning-entry.component.scss']
})
export class ViewProvisioningEntryComponent implements OnInit, AfterViewInit {

  provisioningEntryId: string;
  provisioningEntry: any;

  displayedColumns: string[] = ['officeName', 'productName', 'currencyCode', 'categoryName', 'amountreserved', 'liabilityAccountName', 'expenseAccountName'];
  dataSource: any;
  filterValue: any = { officeName: '', productName: '', categoryName: '' };

  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;

  officeName = new FormControl();
  officeData: any;
  filteredOfficeData: any

  loanProduct = new FormControl();
  loanProductData: any;
  filteredLoanProductData: any;

  provisioningCategory = new FormControl();
  provisioningCategoryData: any;
  filteredProvisioningCategoryData: any;

  constructor(private route: ActivatedRoute,
              private accountingService: AccountingService) { }

  ngOnInit() {
    this.provisioningEntryId = this.route.snapshot.paramMap.get('id');
    this.getProvisioningEntry();
    this.getProvisioningEntryEntries();
    this.getOffices();
    this.getLoanProducts();
    this.getProvisioningCategories();
  }

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

  filterPredicate(data: any, filterValue: any) {
    return data.officeName.toLowerCase().indexOf(filterValue['officeName']) != -1
      && data.productName.toLowerCase().indexOf(filterValue['productName']) != -1
      && data.categoryName.toLowerCase().indexOf(filterValue['categoryName']) != -1;
  }

   applyFilter(filterValue: string, property: string) {
    this.filterValue[property] = filterValue;
    this.dataSource.filter = this.filterValue;
  }

  getProvisioningEntry() {
    this.accountingService.getProvisioningEntry(this.provisioningEntryId)
      .subscribe((provisioningEntry: any) => {
        this.provisioningEntry = provisioningEntry;
      });
  }

  getProvisioningEntryEntries() {
    this.accountingService.getProvisioningEntryEntries(this.provisioningEntryId)
      .subscribe((provisioningEntryEntries: any) => {
        this.dataSource = new MatTableDataSource(provisioningEntryEntries.pageItems);
        this.dataSource.paginator = this.paginator;
        this.dataSource.sort = this.sort;
        this.dataSource.filterPredicate = this.filterPredicate;
      });
  }

  getOffices() {
    this.accountingService.getOffices().subscribe(officeData => {
      this.officeData = officeData;
      this.filteredOfficeData = this.officeName.valueChanges
      .pipe(
        startWith(''),
        map((office: any) => typeof office === 'string' ? office : office.name),
        map((officeName: string) => officeName ? this.filterOfficeAutocompleteData(this.officeData, officeName) : this.officeData)
      );
    });
  }

  getLoanProducts() {
    this.accountingService.getLoanProducts().subscribe(loanProductData => {
      this.loanProductData = loanProductData;
      this.filteredLoanProductData = this.loanProduct.valueChanges
      .pipe(
        startWith(''),
        map((loanProduct: any) => typeof loanProduct === 'string' ? loanProduct : loanProduct.name),
        map((loanProductName: string) => loanProductName ? this.filterLoanProductAutocompleteData(this.loanProductData, loanProductName) : this.loanProductData)
      );
    });
  }

  getProvisioningCategories() {
    this.accountingService.getProvisioningCategories().subscribe(provisioningCategoryData => {
      this.provisioningCategoryData = provisioningCategoryData;
      this.filteredProvisioningCategoryData = this.provisioningCategory.valueChanges
      .pipe(
        startWith(''),
        map((provisioningCategory: any) => typeof provisioningCategory === 'string' ? provisioningCategory : provisioningCategory.categoryName),
        map((provisioningCategoryName: string) => provisioningCategoryName ? this.filterProvisioningCategoryAutocompleteData(this.provisioningCategoryData, provisioningCategoryName) : this.provisioningCategoryData)
      );
    });
  }

  private filterOfficeAutocompleteData(officeData: any, officeName: string): any {
    return officeData.filter((office: any) => office.name.toLowerCase().includes(officeName.toLowerCase()));
  }

  private filterLoanProductAutocompleteData(loanProductData: any, loanProductName: string): any {
    return loanProductData.filter((loanProduct: any) => loanProduct.name.toLowerCase().includes(loanProductName.toLocaleLowerCase()));
  }

  private filterProvisioningCategoryAutocompleteData(provisioningCategoryData: any, provisioningCategoryName: string): any {
    return provisioningCategoryData.filter((provisioningCategory: any) => provisioningCategory.categoryName.toLowerCase().includes(provisioningCategoryName.toLocaleLowerCase()));
  }

}
