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
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { HasPermissionDirective } from '../../../directives/has-permission/has-permission.directive';
import { MatButton } from '@angular/material/button';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import { MatFormField, MatLabel } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';
import { TranslatePipe as NgxTranslatePipe } from '@ngx-translate/core';
import { DateFormatPipe } from '../../../pipes/date-format.pipe';

/**
 * Dividends component.
 */
@Component({
  selector: 'mifosx-dividends-share-product',
  templateUrl: './dividends.component.html',
  styleUrls: ['./dividends.component.scss'],
  imports: [
    HasPermissionDirective,
    MatButton,
    RouterLink,
    FaIconComponent,
    MatFormField,
    MatLabel,
    MatInput,
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
    NgxTranslatePipe
  ]
})
export class ShareProductsDividendsComponent implements OnInit {
  /** Dividends data. */
  dividendData: any;
  /** Columns to be displayed in dividends table. */
  displayedColumns: string[] = [
    'name',
    'dividendPeriodStartDate',
    'dividendPeriodEndDate',
    'amount',
    'status'
  ];
  /** Data source for accounting rules table. */
  dataSource: MatTableDataSource<any>;

  /** Paginator for dividends table. */
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  /** Sorter for dividends table. */
  @ViewChild(MatSort, { static: true }) sort: MatSort;

  /**
   * Retrieves the dividends data from `resolve`.
   * @param {ActivatedRoute} route Activated Route.
   */
  constructor(
    private route: ActivatedRoute,
    private router: Router
  ) {
    this.route.data.subscribe((data: { dividends: any }) => {
      this.dividendData = data.dividends.pageItems;
    });
  }

  /**
   * Sets the dividends table.
   */
  ngOnInit() {
    this.setDividends();
  }

  /**
   * Initializes the data source, paginator and sorter for dividends table.
   */
  setDividends() {
    this.dataSource = new MatTableDataSource(this.dividendData);
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  showDividend(dividendId: any, status: string) {
    const queryParams: any = { status: status };
    this.router.navigate([dividendId], { relativeTo: this.route, queryParams: queryParams });
  }

  /**
   * Filters data in dividends table based on passed value.
   * @param {string} filterValue Value to filter data.
   */
  applyFilter(filterValue: string) {
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }
}
