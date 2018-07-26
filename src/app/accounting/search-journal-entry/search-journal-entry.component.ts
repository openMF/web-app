import { Component, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { MatPaginator, MatSort } from '@angular/material';
import { FormControl } from '@angular/forms';
import { Router } from '@angular/router';

import { merge } from 'rxjs';
import { tap, startWith, map, distinctUntilChanged, debounceTime} from 'rxjs/operators';

import { AccountingService } from '../accounting.service';
import { JournalEntriesDataSource } from './journal-entry.datasource';

@Component({
  selector: 'mifosx-search-journal-entry',
  templateUrl: './search-journal-entry.component.html',
  styleUrls: ['./search-journal-entry.component.scss']
})
export class SearchJournalEntryComponent implements OnInit, AfterViewInit {

  // TODO: Update once language and date settings are setup
  minDate = new Date(2000, 0, 1);
  maxDate = new Date();

  officeName = new FormControl();
  officeData: any;
  filteredOfficeData: any;

  glAccount = new FormControl();
  glAccountData: any;
  filteredGLAccountData: any;

  filter = new FormControl('');
  entryTypeFilterData = [
    {
      option: 'All',
      value: ''
    },
    {
      option: 'Manual Entries',
      value: true
    },
    {
      option: 'System Entries',
      value: false  // Bug: unable to implement from server side
    }
  ];

  transactionDateFrom = new FormControl(new Date(2000, 0, 1));
  transactionDateTo = new FormControl(new Date());

  transactionId = new FormControl();

  displayedColumns: string[] = ['id', 'officeName', 'transactionId', 'transactionDate', 'glAccountType', 'createdByUserName', 'glAccountCode', 'glAccountName', 'debit', 'credit'];
  dataSource: any;

  filterJournalEntriesBy = [
    {
      type: 'officeId',
      value: ''
    },
    {
      type: 'glAccountId',
      value: ''
    },
    {
      type: 'manualEntriesOnly',
      value: ''
    },
    {
      type: 'transactionId',
      value: ''
    },
    {
      type: 'fromDate',
      value: '1 July 2018'
    },
    {
      type: 'toDate',
      value: '31 July 2018'
    },
    {
      type: 'dateFormat',
      value: 'dd MMMM yyyy'
    },
    {
      type: 'locale',
      value: 'en'
    }
  ];

  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;  // Bug: Unable to implement desc order sorting

  constructor(private accountingService: AccountingService,
              private router: Router) { }

  ngOnInit() {
    this.getOffices();
    this.getGlAccounts();
    this.getJournalEntries();
  }

  ngAfterViewInit() {
    this.officeName.valueChanges
      .pipe(
        map(value => value.id ? value.id : ''),
        debounceTime(500),
        distinctUntilChanged(),
        tap((filterValue) => {
          this.applyFilter(filterValue, 'officeId');
        })
      )
      .subscribe();

    this.glAccount.valueChanges
      .pipe(
        map(value => value.id ? value.id : ''),
        debounceTime(500),
        distinctUntilChanged(),
        tap((filterValue) => {
          this.applyFilter(filterValue, 'glAccountId');
        })
      )
      .subscribe();

    this.transactionId.valueChanges
      .pipe(
        debounceTime(500),
        distinctUntilChanged(),
        tap((filterValue) => {
          this.applyFilter(filterValue, 'transactionId');
        })
      )
      .subscribe();

    this.sort.sortChange.subscribe(() => this.paginator.pageIndex = 0);

    merge(this.sort.sortChange, this.paginator.page)
      .pipe(
        tap(() => this.loadJournalEntriesPage())
      )
      .subscribe();
  }

  loadJournalEntriesPage() {
    if (!this.sort.direction) {
      delete this.sort.active;
    }
    this.dataSource.getJournalEntries(this.filterJournalEntriesBy, this.sort.active, this.sort.direction, this.paginator.pageIndex * this.paginator.pageSize, this.paginator.pageSize);
  }

  applyFilter(filterValue: string, property: string) {
    this.paginator.pageIndex = 0;
    const findIndex = this.filterJournalEntriesBy.findIndex(filter => filter.type === property);
    this.filterJournalEntriesBy[findIndex].value = filterValue;
    this.loadJournalEntriesPage();
  }

  viewTransaction(journalEntry: any) {
    this.router.navigate(['/accounting/transactions/view', journalEntry.transactionId]);
  }

  displayOfficeName(office?: any): string | undefined {
    return office ? office.name : undefined;
  }

  displayGLAccount(glAccount?: any): string | undefined {
    return glAccount ? glAccount.name + ' (' + glAccount.glCode + ')' : undefined;
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

  getGlAccounts() {
    this.accountingService.getGlAccounts().subscribe(glAccountData => {
      this.glAccountData = glAccountData;
      this.filteredGLAccountData = this.glAccount.valueChanges
      .pipe(
        startWith(''),
        map((glAccount: any) => typeof glAccount === 'string' ? glAccount : glAccount.name + ' (' + glAccount.glCode + ')'),
        map((glAccount: string) => glAccount ? this.filterGLAccountAutocompleteData(this.glAccountData, glAccount) : this.glAccountData)
      );
    });
  }

  private filterOfficeAutocompleteData(officeData: any, officeName: string): any {
    return officeData.filter((office: any) => office.name.toLowerCase().includes(officeName.toLowerCase()));
  }

  private filterGLAccountAutocompleteData(glAccountData: any, glAccount: string): any {
    return glAccountData.filter((option: any) => (option.name + ' (' + option.glCode + ')').toLowerCase().includes(glAccount.toLowerCase()));
  }

  getJournalEntries() {
    this.dataSource = new JournalEntriesDataSource(this.accountingService);
    this.dataSource.getJournalEntries(this.filterJournalEntriesBy, this.sort.active, this.sort.direction, this.paginator.pageIndex * this.paginator.pageSize, this.paginator.pageSize);
  }

}
