/** Angular Imports */
import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';

/** Custom Components */
import { SiteSelectorChange } from 'app/shared/site-selector/site-selector.component';

/** Group impact row interface */
export interface GroupImpactRow {
  group: string;
  site: string;
  toRemove: number;
  toSkip: number;
}

/**
 * Group Bulk Client Removal (Impact Preview) Component.
 *
 * Displays a preview of the impact of a bulk client group removal
 * before submitting the request for approval.
 */
@Component({
  selector: 'mifosx-group-bulk-client-removal',
  templateUrl: './group-bulk-client-removal.component.html',
  styleUrls: ['./group-bulk-client-removal.component.scss'],
})
export class GroupBulkClientRemovalComponent implements OnInit, AfterViewInit {
  /** Site selection passed via router state from the groups page. */
  siteSelection: SiteSelectorChange | null = null;
  /** Scope breadcrumb (e.g. Country | Region | District) */
  scope: string[] = [];
  /** Summary statistics */
  groupsAffected = 0;
  clientsInScope = 0;
  toBeRemoved = 0;
  toBeSkipped = 0;
  /** Exceptions */
  exceptions = {
    bannedClients: true,
    clientsWithActiveLoans: true,
    groupsWithActiveLoans: true,
  };
  /** Columns displayed in impact table */
  displayedColumns: string[] = ['group', 'site', 'toRemove', 'toSkip'];
  /** Impact preview rows */
  groups: GroupImpactRow[] = [];
  /** Data source for impact table */
  dataSource = new MatTableDataSource<GroupImpactRow>([]);
  /** Total number of groups affected (for footer note) */
  totalGroups = 0;

  /** Paginator for impact table */
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;

  constructor(private router: Router, private route: ActivatedRoute) {
    this.siteSelection =
      this.router.getCurrentNavigation()?.extras?.state?.['siteSelection'] ??
      history.state?.siteSelection ??
      null;
  }

  ngOnInit(): void {
    if (!this.siteSelection) {
      // No selection provided (e.g. page refresh or direct navigation): go back to groups.
      this.router.navigate(['../'], { relativeTo: this.route });
      return;
    }
    //console.log('Site selection:', this.siteSelection);
    this.scope = [this.siteSelection.regionName, this.siteSelection.districtName].filter(
      (name): name is string => !!name
    );
    // TODO: Load impact preview data from the API / route resolver.
    this.dataSource.data = this.groups;
  }

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
  }

  /**
   * Downloads skipped or removed clients as CSV.
   * @param {('skipped' | 'removed')} type Type of clients to export.
   */
  downloadCsv(type: 'skipped' | 'removed') {
    const rows = this.groups.map((g) =>
      [g.group, g.site, type === 'removed' ? g.toRemove : g.toSkip].join(',')
    );
    const header = ['Group', 'Site', type === 'removed' ? 'To remove' : 'To skip'].join(',');
    const csv = [header, ...rows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${type}-clients.csv`;
    link.click();
    window.URL.revokeObjectURL(url);
  }

  /** Navigates back to the groups page. */
  cancel() {
    this.router.navigate(['../'], { relativeTo: this.route });
  }

  /** Submits the bulk removal request for approval. */
  submitForApproval() {
    // TODO: Submit bulk removal request for approval via API.
    this.router.navigate(['../'], { relativeTo: this.route });
  }
}
