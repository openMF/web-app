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
import { HasPermissionDirective } from '../../../directives/has-permission/has-permission.directive';
import { MatButton } from '@angular/material/button';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import { MatFormField, MatLabel } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';
import { TranslatePipe as NgxTranslatePipe } from '@ngx-translate/core';
import { TranslatePipe } from '@pipes/translate.pipe';

@Component({
  selector: 'mifosx-delinquency-range',
  templateUrl: './delinquency-range.component.html',
  styleUrls: ['./delinquency-range.component.scss'],
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
    TranslatePipe,
    NgxTranslatePipe
  ]
})
export class DelinquencyRangeComponent implements OnInit {
  delinquencyRangeData: any;
  /** Columns to be displayed in delinquency range table. */
  displayedColumns: string[] = [
    'classification',
    'minimumAgeDays',
    'maximumAgeDays'
  ];
  /** Data source for delinquency range table. */
  dataSource: MatTableDataSource<any>;

  /** Paginator for delinquency range table. */
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  /** Sorter for delinquency range table. */
  @ViewChild(MatSort, { static: true }) sort: MatSort;

  constructor(private route: ActivatedRoute) {
    this.route.data.subscribe((data: { delinquencyRanges: any }) => {
      this.delinquencyRangeData = data.delinquencyRanges;
    });
  }

  ngOnInit(): void {
    this.setDatasource();
  }

  /**
   * Filters data in delinquency range table based on passed value.
   * @param {string} filterValue Value to filter data.
   */
  applyFilter(filterValue: string) {
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }

  /**
   * Initializes the data source, paginator and sorter for delinquency range table.
   */
  setDatasource() {
    this.dataSource = new MatTableDataSource(this.delinquencyRangeData);
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }
}
