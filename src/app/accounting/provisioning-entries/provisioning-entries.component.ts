import { Component, OnInit, ViewChild } from '@angular/core';
import { MatSort, MatPaginator, MatTableDataSource } from '@angular/material';

import { AccountingService } from '../accounting.service';

@Component({
  selector: 'mifosx-provisioning-entries',
  templateUrl: './provisioning-entries.component.html',
  styleUrls: ['./provisioning-entries.component.scss']
})
export class ProvisioningEntriesComponent implements OnInit {

  displayedColumns: string[] = ['createdUser', 'createdDate', 'journalEntry', 'viewReport', 'recreateProvisioning', 'viewJournalEntry'];
  dataSource: any;

  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;

  constructor(private accountingService: AccountingService) { }

  ngOnInit() {
    this.getProvisioningEntries();
  }

  getProvisioningEntries() {
    this.accountingService.getProvisioningEntries().subscribe((provisioningEntryData: any) => {
      this.dataSource = new MatTableDataSource(provisioningEntryData);
      this.dataSource.paginator = this.paginator;
      this.dataSource.sort = this.sort;
    });
  }

}
