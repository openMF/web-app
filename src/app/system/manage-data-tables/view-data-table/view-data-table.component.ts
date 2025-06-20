/** Angular Imports */
import { Component, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort, MatSortHeader } from '@angular/material/sort';
import {
  MatTableDataSource,
  MatTable,
  MatColumnDef,
  MatHeaderCellDef,
  MatHeaderCell,
  MatCellDef,
  MatCell,
  MatHeaderRowDef,
  MatHeaderRow,
  MatRowDef,
  MatRow
} from '@angular/material/table';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';

/** Custom Services */
import { SystemService } from '../../system.service';

/** Custom Components */
import { TranslateService } from '@ngx-translate/core';
import { DeleteDialogComponent } from 'app/shared/delete-dialog/delete-dialog.component';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import { MatTooltip } from '@angular/material/tooltip';
import { STANDALONE_SHARED_IMPORTS } from 'app/standalone-shared.module';

/**
 * View Data Table Component
 */
@Component({
  selector: 'mifosx-view-data-table',
  templateUrl: './view-data-table.component.html',
  styleUrls: ['./view-data-table.component.scss'],
  imports: [
    ...STANDALONE_SHARED_IMPORTS,
    FaIconComponent,
    MatTable,
    MatSort,
    MatColumnDef,
    MatHeaderCellDef,
    MatHeaderCell,
    MatSortHeader,
    MatCellDef,
    MatCell,
    MatTooltip,
    MatHeaderRowDef,
    MatHeaderRow,
    MatRowDef,
    MatRow,
    MatPaginator
  ]
})
export class ViewDataTableComponent implements OnInit {
  /** Data Table Data */
  dataTableData: any;
  /** Column Data */
  columnsData: any;
  /** Columns to be displayed in columns table. */
  displayedColumns: string[] = [
    'columnName',
    'columnDisplayType',
    'columnLength',
    'columnCode',
    'isColumnNullable',
    'isColumnUnique',
    'isColumnIndexed'
  ];
  /** Data source for columns table. */
  dataSource: MatTableDataSource<any>;

  /** Paginator for columns table. */
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  /** Sorter for columns table. */
  @ViewChild(MatSort, { static: true }) sort: MatSort;

  /**
   * Retrieves the data table data from `resolve`.
   * @param {ActivatedRoute} route Activated Route.
   * @param {SystemService} systemService System Service.
   * @param {Router} router Router for navigation.
   * @param {MatDialog} dialog Dialog reference.
   *  @param {TranslateService} translateService Translate Service.
   */
  constructor(
    private route: ActivatedRoute,
    private systemService: SystemService,
    private router: Router,
    private dialog: MatDialog,
    private translateService: TranslateService
  ) {
    this.route.data.subscribe((data: { dataTable: any }) => {
      this.dataTableData = data.dataTable;
      this.columnsData = this.dataTableData.columnHeaderData;
    });
  }

  /**
   * Sets the columns table.
   */
  ngOnInit() {
    this.setColumnsTable();
  }

  /**
   * Initializes the data source, paginator and sorter for columns table.
   */
  setColumnsTable() {
    this.columnsData.shift();
    // TODO: Figure out a better approach in order to pass only updated parameters instead of all of them.
    this.dataSource = new MatTableDataSource(this.columnsData);
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  /**
   * Deletes the current data table.
   */
  delete() {
    const deleteDataTableDialogRef = this.dialog.open(DeleteDialogComponent, {
      data: {
        deleteContext:
          this.translateService.instant('labels.inputs.Data Table') + ' ' + this.dataTableData.registeredTableName
      }
    });
    deleteDataTableDialogRef.afterClosed().subscribe((response: any) => {
      if (response.delete) {
        this.systemService.deleteDataTable(this.dataTableData.registeredTableName).subscribe(() => {
          this.router.navigate(['/system/data-tables'], { relativeTo: this.route });
        });
      }
    });
  }
}
