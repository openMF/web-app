import { Component, OnInit, ViewChild } from '@angular/core';
import { MatPaginator, MatSort, MatTableDataSource } from '@angular/material';
import { FormControl } from '@angular/forms';
import { Router } from '@angular/router';

import { AccountingService } from '../accounting.service';

@Component({
  selector: 'mifosx-search-journal-entry',
  templateUrl: './search-journal-entry.component.html',
  styleUrls: ['./search-journal-entry.component.scss']
})
export class SearchJournalEntryComponent implements OnInit {

  officeName = new FormControl();
  glAccountCode = new FormControl();
  transactionDateFrom = new FormControl(new Date(2000, 0, 1));
  transactionDateTo = new FormControl(new Date());
  transactionId = new FormControl();
  minDate = new Date(2000, 0, 1);
  maxDate = new Date();
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
      value: false
    }
  ];
  filterValue: any = { officeName: '', glAccountCode: '', filter: '', transactionId: '' };

  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;

  constructor(private accountingService: AccountingService,
              private router: Router) { }

  ngOnInit() {
    this.getOffices();
    this.getGlAccounts();
    this.getJournalEntries();
  }

  getJournalEntries() {
    this.accountingService.getJournalEntries().subscribe((journalEntryData: any) => {
      this.dataSource = new MatTableDataSource(journalEntryData.pageItems);
      this.dataSource.paginator = this.paginator;
      this.dataSource.sortingDataAccessor = (transaction: any, property: any) => {
        switch (property) {
          case 'glAccountType': return transaction.glAccountType.value;
          case 'debit': return transaction.amount;
          case 'credit': return transaction.amount;
          default: return transaction[property];
        }
      };
      this.dataSource.sort = this.sort;
      this.dataSource.filterPredicate = this.filterPredicate;
    });
  }

  filterPredicate(data: any, filterValue: string) {
    return data.officeName.indexOf(filterValue['officeName']) != -1
      && data.glAccountCode.indexOf(filterValue['glAccountCode']) != -1
      && data.manualEntry.toString().indexOf(filterValue['filter']) != -1
      && data.transactionId.indexOf(filterValue['transactionId']) != -1;
  }

  applyFilter(filterValue: string, property: string) {
    this.filterValue[property] = filterValue;
    this.dataSource.filter = this.filterValue;
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
