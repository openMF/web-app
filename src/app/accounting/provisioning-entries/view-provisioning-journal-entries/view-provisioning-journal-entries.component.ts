import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { MatPaginator, MatSort, MatTableDataSource } from '@angular/material';

import { AccountingService } from '../../accounting.service';

@Component({
  selector: 'mifosx-view-provisioning-journal-entries',
  templateUrl: './view-provisioning-journal-entries.component.html',
  styleUrls: ['./view-provisioning-journal-entries.component.scss']
})
export class ViewProvisioningJournalEntriesComponent implements OnInit {

  provisioningEntryId: string;

  displayedColumns: string[] = ['id', 'officeName', 'transactionDate', 'transactionId', 'glAccountType', 'createdByUserName', 'glAccountCode', 'glAccountName', 'debit', 'credit'];
  dataSource: any;

  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;

  constructor(private route: ActivatedRoute,
              private accountingService: AccountingService) { }

  ngOnInit() {
    this.provisioningEntryId = this.route.snapshot.paramMap.get('id');
    this.getProvisioningJournalEntry();
  }

  getProvisioningJournalEntry() {
    this.accountingService.getProvisioningJournalEntries(this.provisioningEntryId)
      .subscribe((provisioningJournalEntryData: any) => {
        this.dataSource = new MatTableDataSource(provisioningJournalEntryData.pageItems);
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
      });
  }

  applyFilter(filterValue: string) {
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }

}
