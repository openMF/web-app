/** Angular Imports */
import { Component, OnInit, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { Router, ActivatedRoute } from '@angular/router';

/** Custom Services */
import { AccountingService } from '../accounting.service';

/**
 * Provisioning entries component.
 */
@Component({
  selector: 'mifosx-provisioning-entries',
  templateUrl: './provisioning-entries.component.html',
  styleUrls: ['./provisioning-entries.component.scss']
})
export class ProvisioningEntriesComponent implements OnInit {

  /** Provisioning entry data. */
  provisioningEntryData: any;
  /** Columns to be displayed in provisioning entries table. */
  displayedColumns: string[] = ['createdUser', 'createdDate', 'journalEntry', 'viewReport', 'recreateProvisioning', 'viewJournalEntry'];
  /** Data source for provisioning entries table. */
  dataSource: MatTableDataSource<any>;

  /** Paginator for provisioning entries table. */
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  /** Sorter for provisioning entries table. */
  @ViewChild(MatSort, { static: true }) sort: MatSort;

  /**
   * Retrieves the provisioning entries data from `resolve`.
   * @param {AccountingService} accountingService Accounting Service.
   * @param {ActivatedRoute} route Activated Route.
   * @param {Router} router Router for navigation.
   */
  constructor(private accountingService: AccountingService,
              private route: ActivatedRoute,
              private router: Router) {
    this.route.data.subscribe((data: { provisioningEntries: any }) => {
      this.provisioningEntryData = data.provisioningEntries.pageItems;
    });
  }

  /**
   * Sets the provisioning entries table.
   */
  ngOnInit() {
    this.setProvisioningEntries();
  }

  /**
   * Initializes the data source, paginator and sorter for provisioning entries table.
   */
  setProvisioningEntries() {
    this.dataSource = new MatTableDataSource(this.provisioningEntryData);
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  /**
   * Filters data in provisioning entries table based on passed value.
   * @param {string} filterValue Value to filter data.
   */
  applyFilter(filterValue: string) {
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }

  /**
   * Recreates provisioning entry.
   * @param {Event} $event Event to stop propagation.
   * @param {string} provisioningEntryId Provisioning entry id.
   */
  recreateProvisioning($event: Event, provisioningEntryId: string) {
    this.accountingService.recreateProvisioningEntries(provisioningEntryId)
      .subscribe((response: any) => {
        this.router.navigate(['view', response.resourceId], { relativeTo: this.route });
      });
    $event.stopPropagation();
  }

  /**
   * View journal entries for the provisioning entry.
   * @param {Event} $event Event to stop propagation.
   * @param {number} provisioningEntryId Provisioning entry id.
   */
  viewJournalEntry($event: Event, provisioningEntryId: number) {
    this.router.navigate(['journal-entries/view', provisioningEntryId], { relativeTo: this.route });
    $event.stopPropagation();
  }

}
