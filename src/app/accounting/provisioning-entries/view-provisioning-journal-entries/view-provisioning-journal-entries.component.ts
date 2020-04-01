/** Angular Imports */
import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { MatPaginator, MatSort, MatTableDataSource } from '@angular/material';

/**
 * View provisioning journal entries component.
 */
@Component({
  selector: 'mifosx-view-provisioning-journal-entries',
  templateUrl: './view-provisioning-journal-entries.component.html',
  styleUrls: ['./view-provisioning-journal-entries.component.scss']
})
export class ViewProvisioningJournalEntriesComponent implements OnInit {

  /** Provisioning journal entry data. */
  provisioningJournalEntryData: any;
  /** Columns to be displayed in provisioning journal entries table. */
  displayedColumns: string[] = ['id', 'officeName', 'transactionDate', 'transactionId', 'glAccountType', 'createdByUserName', 'glAccountCode', 'glAccountName', 'debit', 'credit'];
  /** Data source for provisioning journal entries table. */
  dataSource: MatTableDataSource<any>;

  /** Paginator for provisioning journal entries table. */
  @ViewChild(MatPaginator) paginator: MatPaginator;
  /** Sorter for provisioning journal entries table. */
  @ViewChild(MatSort) sort: MatSort;

  /**
   * @param {ActivatedRoute} route Activated Route.
   */
  constructor(private route: ActivatedRoute) {}

  /**
   * Retrieves the provisioning journal entries data from `resolve`.
   * Sets the provisioning journal entries table.
   */
  ngOnInit() {
    this.route.data.subscribe((data: { provisioningJournalEntry: any }) => {
      this.provisioningJournalEntryData = data.provisioningJournalEntry.pageItems;
    });
    this.setProvisioningJournalEntry();
  }

  /**
   * Initializes the data source, paginator and sorter for provisioning journal entries table.
   */
  setProvisioningJournalEntry() {
    this.dataSource = new MatTableDataSource(this.provisioningJournalEntryData);
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
  }

  /**
   * Filters data in provisioning journal entries table based on passed value.
   * @param {string} filterValue Value to filter data.
   */
  applyFilter(filterValue: string) {
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }

}
