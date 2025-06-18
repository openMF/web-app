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
  selector: 'mifosx-delinquency-bucket',
  templateUrl: './delinquency-bucket.component.html',
  styleUrls: ['./delinquency-bucket.component.scss'],
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
export class DelinquencyBucketComponent implements OnInit {
  delinquencyBucketData: any;
  /** Columns to be displayed in delinquency bucket table. */
  displayedColumns: string[] = ['name'];
  /** Data source for delinquency bucket table. */
  dataSource: MatTableDataSource<any>;

  /** Paginator for delinquency bucket table. */
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  /** Sorter for delinquency bucket table. */
  @ViewChild(MatSort, { static: true }) sort: MatSort;

  constructor(private route: ActivatedRoute) {
    this.route.data.subscribe((data: { delinquencyBuckets: any }) => {
      this.delinquencyBucketData = data.delinquencyBuckets;
    });
  }

  ngOnInit(): void {
    this.setDatasource();
  }

  /**
   * Filters data in delinquency bucket table based on passed value.
   * @param {string} filterValue Value to filter data.
   */
  applyFilter(filterValue: string) {
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }

  /**
   * Initializes the data source, paginator and sorter for delinquency bucket table.
   */
  setDatasource() {
    this.dataSource = new MatTableDataSource(this.delinquencyBucketData);
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }
}
