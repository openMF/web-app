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
import { MatTooltip } from '@angular/material/tooltip';
import { DateFormatPipe } from '../../pipes/date-format.pipe';
import { STANDALONE_SHARED_IMPORTS } from 'app/standalone-shared.module';

/**
 * Tellers component.
 */
@Component({
  selector: 'mifosx-tellers',
  templateUrl: './tellers.component.html',
  styleUrls: ['./tellers.component.scss'],
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
    MatPaginator,
    DateFormatPipe
  ]
})
export class TellersComponent implements OnInit {
  /** Tellers data. */
  tellersData: any;
  /** Columns to be displayed in tellers table. */
  displayedColumns: string[] = [
    'officeName',
    'name',
    'status',
    'startDate',
    'actions'
  ];
  /** Data source for tellers table. */
  dataSource: MatTableDataSource<any>;

  /** Paginator for tellers table. */
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  /** Sorter for tellers table. */
  @ViewChild(MatSort, { static: true }) sort: MatSort;

  /**
   * Retrieves the tellers data from `resolve`.
   * @param {ActivatedRoute} route Activated Route.
   */
  constructor(private route: ActivatedRoute) {
    this.route.data.subscribe((data: { tellers: any }) => {
      this.tellersData = data.tellers;
    });
  }

  /**
   * Filters data in tellers table based on passed value.
   * @param {string} filterValue Value to filter data.
   */
  applyFilter(filterValue: string) {
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }

  /**
   * Sets the tellers table.
   */
  ngOnInit() {
    this.setTellers();
  }

  /**
   * Initializes the data source, paginator and sorter for tellers table.
   */
  setTellers() {
    this.dataSource = new MatTableDataSource(this.tellersData);
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }
}
