import { Component, OnInit, ViewChild } from '@angular/core';
import { MatPaginator, MatSort } from '@angular/material';
import { FormControl } from '@angular/forms';
import { Router } from '@angular/router';

import { merge } from 'rxjs';
import { tap} from 'rxjs/operators';

import { AccountingService } from '../accounting.service';
import { JournalEntriesDataSource } from './journal-entry.datasource';

@Component({
  selector: 'mifosx-search-journal-entry',
  templateUrl: './search-journal-entry.component.html',
  styleUrls: ['./search-journal-entry.component.scss']
})
export class SearchJournalEntryComponent implements OnInit {

  // TODO: Update when date and language are set up throughout the application
  minDate = new Date(2000, 0, 1);
  maxDate = new Date();
  officeName = new FormControl();
  glAccountCode = new FormControl();
  transactionDateFrom = new FormControl(new Date(2000, 0, 1));
  transactionDateTo = new FormControl(new Date());
  transactionId = new FormControl();
  filter = new FormControl('');
  displayedColumns: string[] = ['id', 'officeName', 'transactionId', 'transactionDate', 'glAccountType', 'createdByUserName', 'glAccountCode', 'glAccountName', 'debit', 'credit'];
  dataSource: any;
  officeData: any;
  glAccountData: any;
  filterData = [
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
  filterBy = [
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
    this.sort.sortChange.subscribe(() => this.paginator.pageIndex = 0);
    merge(this.sort.sortChange, this.paginator.page)
      .pipe(
        tap(() => this.loadJournalEntriesPage())
      )
      .subscribe();
  }

  getJournalEntries() {
    this.dataSource = new JournalEntriesDataSource(this.accountingService);
    this.dataSource.loadJournalEntries(this.filterBy, this.sort.active, this.sort.direction, this.paginator.pageIndex, this.paginator.pageSize);
  }

  loadJournalEntriesPage() {
    if(!this.sort.direction) {
      delete this.sort.active;
    }
    this.dataSource.loadJournalEntries(this.filterBy, this.sort.active, this.sort.direction, this.paginator.pageIndex * this.paginator.pageSize, this.paginator.pageSize);
  }

  applyFilter(filterValue: string, property: string) {
    this.paginator.pageIndex = 0;
    let findIndex = this.filterBy.findIndex(filter => filter.type === property);
    this.filterBy[findIndex].value = filterValue;
    this.loadJournalEntriesPage();
  }

  getOffices() {
    this.accountingService.getOffices().subscribe(officeData => {
      this.officeData = officeData;
    });
  }

  getGlAccounts() {
    this.accountingService.getGlAccounts().subscribe(glAccountData => {
      this.glAccountData = glAccountData;
    });
  }

  viewTransaction(journalEntry: any) {
    this.router.navigate(['/accounting/transactions/view', journalEntry.transactionId]);
  }

}
