import { Component, OnInit, ViewChild } from '@angular/core';
import { MatSort, MatPaginator, MatTableDataSource } from '@angular/material';
import { Router } from '@angular/router';

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

  constructor(private accountingService: AccountingService,
              private router: Router) { }

  ngOnInit() {
    this.getProvisioningEntries();
  }

  getProvisioningEntries() {
    this.accountingService.getProvisioningEntries().subscribe((provisioningEntryData: any) => {
      this.dataSource = new MatTableDataSource(provisioningEntryData.pageItems);
      this.dataSource.paginator = this.paginator;
      this.dataSource.sort = this.sort;
    });
  }

  applyFilter(filterValue: string) {
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }

  viewReport($event: any, provisioningEntryId: number) {
    // Tenant Customizable
    $event.stopPropagation();
  }

  recreateProvisioning($event: any, provisioningEntryId: string) {
    this.accountingService.recreateProvisioningEntries(provisioningEntryId)
      .subscribe((response: any) => {
        this.router.navigate(['/accounting/provisioning-entries/view', response.resourceId]);
      });
    $event.stopPropagation();
  }

  viewJournalEntry($event: any, provisioningEntryId: number) {
    this.router.navigate(['/accounting/provisioning-entries/journal-entries/view', provisioningEntryId]);
    $event.stopPropagation();
  }

}
