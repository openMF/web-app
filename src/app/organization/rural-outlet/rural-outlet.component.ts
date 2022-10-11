import { Component, OnInit, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { ActivatedRoute, Router } from '@angular/router';
import { OrganizationService } from 'app/organization/organization.service';
import { MatDialog } from '@angular/material/dialog';

import { DisableDialogComponent } from 'app/shared/disable-dialog/disable-dialog.component';
import { EnableDialogComponent } from 'app/shared/enable-dialog/enable-dialog.component';

@Component({
  selector: 'mifosx-rural-outlet',
  templateUrl: './rural-outlet.component.html',
  styleUrls: ['./rural-outlet.component.scss'],
})
export class RuralOutletComponent implements OnInit {
  outletData: any;
    /** Columns to be displayed in offices table. */
    displayedColumns: string[] = ['name', 'externalId', 'openingDate', 'actions'];
    /** Data source for offices table. */
    dataSource: MatTableDataSource<any>;

    /** Paginator for offices table. */
    @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
    /** Sorter for offices table. */
    @ViewChild(MatSort, { static: true }) sort: MatSort;

  constructor(private route: ActivatedRoute, private organizationService: OrganizationService,
    private dialog: MatDialog, private router: Router) {
    this.route.data.subscribe((data: { offices: any }) => {
      this.outletData = data?.offices;
    });
  }

  /**
   * Filters data in offices table based on passed value.
   * @param {string} filterValue Value to filter data.
   */
   applyFilter(filterValue: string) {
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }

  ngOnInit(): void {
    this.setOutlets();
  }

  /**
   * Initializes the data source, paginator and sorter for offices table.
   */
   setOutlets() {
    this.dataSource = new MatTableDataSource(this.outletData);
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  deactivateOutlet(outletId: any,status:boolean) {
    const outlet=this.outletData.filter(x=>x.id===outletId);
    if(!status){
    const disableOutletDialogRef = this.dialog.open(DisableDialogComponent, {
      data: { disableContext: `rural outlet : ${outlet[0]?.name}` }
    });
    disableOutletDialogRef.afterClosed().subscribe((response: any) => {
      if (response.disable) {
        this.organizationService.deactivateRuralOutlet(outletId, status).subscribe(() => {
          this.router.navigate(['../'], { relativeTo: this.route });
        });
      }
    });
  }
  else{
    const enableletDialogRef = this.dialog.open(EnableDialogComponent, {
      data: { enableContext: `rural outlet : ${outlet[0]?.name}` }
    });
    enableletDialogRef.afterClosed().subscribe((response: any) => {
      if (response.enable) {
        this.organizationService.deactivateRuralOutlet(outletId, status).subscribe(() => {
          this.router.navigate(['../'], { relativeTo: this.route });
        });
      }
    });
  }
  }
}
