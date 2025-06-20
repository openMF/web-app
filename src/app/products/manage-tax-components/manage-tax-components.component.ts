/** Angular Imports */
import { Component, OnInit, ViewChild } from '@angular/core';
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
import { ActivatedRoute, RouterLink } from '@angular/router';

/** rxjs Imports */
import { of } from 'rxjs';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import { DateFormatPipe } from '../../pipes/date-format.pipe';
import { FormatNumberPipe } from '../../pipes/format-number.pipe';
import { STANDALONE_SHARED_IMPORTS } from 'app/standalone-shared.module';

/**
 * Manage Tax Components component.
 */
@Component({
  selector: 'mifosx-manage-tax-components',
  templateUrl: './manage-tax-components.component.html',
  styleUrls: ['./manage-tax-components.component.scss'],
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
    MatHeaderRowDef,
    MatHeaderRow,
    MatRowDef,
    MatRow,
    MatPaginator,
    DateFormatPipe,
    FormatNumberPipe
  ]
})
export class ManageTaxComponentsComponent implements OnInit {
  /** Tax Components data. */
  taxComponentData: any;
  /** Columns to be displayed in tax component table. */
  displayedColumns: string[] = [
    'name',
    'percentage',
    'startDate',
    'glAccount'
  ];
  /** Data source for tax component table. */
  dataSource: MatTableDataSource<any>;

  /** Paginator for tax component table. */
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  /** Sorter for tax component table. */
  @ViewChild(MatSort, { static: true }) sort: MatSort;

  /**
   * Retrieves the tax component data from `resolve`.
   * @param {ActivatedRoute} route Activated Route.
   */
  constructor(private route: ActivatedRoute) {
    this.route.data.subscribe((data: { taxComponents: any }) => {
      this.taxComponentData = data.taxComponents;
    });
  }

  /**
   * Filters data in tax component table based on passed value.
   * @param {string} filterValue Value to filter data.
   */
  applyFilter(filterValue: string) {
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }

  /**
   * Sets the tax component table.
   */
  ngOnInit() {
    this.setTaxComponents();
  }

  /**
   * Initializes the data source, paginator and sorter for tax component table.
   */
  setTaxComponents() {
    this.dataSource = new MatTableDataSource(this.taxComponentData);
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }
}
