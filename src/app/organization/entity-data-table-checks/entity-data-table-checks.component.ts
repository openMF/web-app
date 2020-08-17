/** Angular Imports */
import { Component, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { ActivatedRoute } from '@angular/router';

/** Custom Services */
import { OrganizationService } from '../organization.service';

/** Custom Components */
import { DeleteDialogComponent } from '../../shared/delete-dialog/delete-dialog.component';

/**
 * Entity Data Table Checks component.
 */
@Component({
  selector: 'mifosx-entity-data-table-checks',
  templateUrl: './entity-data-table-checks.component.html',
  styleUrls: ['./entity-data-table-checks.component.scss']
})
export class EntityDataTableChecksComponent implements OnInit {

  /** Entity Data Table Checks data. */
  entityDataTableChecksData: any;
  /** Columns to be displayed in entity data table checks table. */
  displayedColumns: string[] = ['entity', 'productName', 'datatableName', 'status', 'systemDefined', 'actions'];
  /** Data source for entity data table checks table. */
  dataSource: MatTableDataSource<any>;
  /** Corresponding values for Entity */
  entityValues: any = [
    {
      code: 'm_client',
      value: 'Client'
    },
    {
      code: 'm_loan',
      value: 'Loan'
    },
    {
      code: 'm_group',
      value: 'Group'
    },
    {
      code: 'm_savings_account',
      value: 'Savings Account'
    }
  ];

  /** Paginator for entity data table checks table. */
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  /** Sorter for entity data table checks table. */
  @ViewChild(MatSort, { static: true }) sort: MatSort;

  /**
   * Retrieves the entity data table checks data from `resolve`.
   * @param {OrganizationService} organizationService Organization Service.
   * @param {ActivatedRoute} route Activated Route.
   * @param {MatDialog} dialog Dialog reference.
   */
  constructor(private organizationService: OrganizationService,
              private route: ActivatedRoute,
              private dialog: MatDialog) {
    this.route.data.subscribe(( data: { entityDataTableChecks: any }) => {
      this.entityDataTableChecksData = data.entityDataTableChecks.pageItems;
    });
  }

  /**
   * Filters data in entity data table checks table based on passed value.
   * @param {string} filterValue Value to filter data.
   */
  applyFilter(filterValue: string) {
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }

  /**
   * Sets the entity data table checks table.
   */
  ngOnInit() {
    this.setEntityDataTableChecks();
    this.setEntity();
  }

  /**
   * Sets Entity to its corresponding values
   */
  setEntity() {
    for (let i = 0; i < this.dataSource.data.length; i++) {
      for (let j = 0; j < this.entityValues.length; j++) {
        if (this.entityValues[j].code === this.dataSource.data[i].entity) {
          this.dataSource.data[i].entity = this.entityValues[j].value;
        }
      }
    }
  }

  /**
   * Initializes the data source, paginator and sorter for entity data table checks table.
   */
  setEntityDataTableChecks() {
    this.dataSource = new MatTableDataSource(this.entityDataTableChecksData);
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
    this.dataSource.sortingDataAccessor = (item, property) => {
      switch (property) {
        case 'status': return item.status.value;
        default: return item[property];
      }
    };
  }

  /**
   * Deletes the entity data table check
   * @param {string} entityDataTableCheckId Entity Data Table Check ID of entity data table check to be deleted.
   */
  deleteEntityDataTableCheck(entityDataTableCheckId: string) {
    const deleteEntityDataTableCheckDialogRef = this.dialog.open(DeleteDialogComponent, {
      data: { deleteContext: `entity data table check ${entityDataTableCheckId}` }
    });
    deleteEntityDataTableCheckDialogRef.afterClosed().subscribe((response: any) => {
      if (response.delete) {
        this.organizationService.deleteEntityDataTableCheck(entityDataTableCheckId)
          .subscribe(() => {
            this.entityDataTableChecksData = this.entityDataTableChecksData.filter((entityDataTableChecks: any) => entityDataTableChecks.id !== entityDataTableCheckId);
            this.dataSource.data = this.entityDataTableChecksData;
          });
      }
    });
  }

}
