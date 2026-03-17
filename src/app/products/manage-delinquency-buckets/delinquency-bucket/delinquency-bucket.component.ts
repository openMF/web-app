/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

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
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import { STANDALONE_SHARED_IMPORTS } from 'app/standalone-shared.module';
import { MatMenu, MatMenuTrigger, MatMenuItem } from '@angular/material/menu';
import { DelinquencyBucketBaseComponent } from '../delinquency-base.component';

@Component({
  selector: 'mifosx-delinquency-bucket',
  templateUrl: './delinquency-bucket.component.html',
  styleUrls: ['./delinquency-bucket.component.scss'],
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
    MatMenu,
    MatMenuTrigger,
    MatMenuItem
  ]
})
export class DelinquencyBucketComponent extends DelinquencyBucketBaseComponent implements OnInit {
  delinquencyBucketData: any;
  /** Columns to be displayed in delinquency bucket table. */
  displayedColumns: string[] = [
    'name',
    'bucketType'
  ];
  /** Data source for delinquency bucket table. */
  dataSource: MatTableDataSource<any>;

  /** Paginator for delinquency bucket table. */
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  /** Sorter for delinquency bucket table. */
  @ViewChild(MatSort, { static: true }) sort: MatSort;

  constructor() {
    super();
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
