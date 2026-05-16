/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import { ChangeDetectionStrategy, Component, inject, OnInit, ViewChild } from '@angular/core';
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
import { MatTooltip } from '@angular/material/tooltip';
import { ActivatedRoute } from '@angular/router';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import { STANDALONE_SHARED_IMPORTS } from 'app/standalone-shared.module';
import { NearBreach } from '../../models/loan-product.model';
import { FormatNumberPipe } from '@pipes/format-number.pipe';
import { ProductsService } from 'app/products/products.service';
import { DeleteDialogComponent } from 'app/shared/delete-dialog/delete-dialog.component';
import { MatDialog } from '@angular/material/dialog';

@Component({
  selector: 'mifosx-near-breach-configuration',
  templateUrl: './near-breach-configuration.component.html',
  styleUrl: './near-breach-configuration.component.scss',
  standalone: true,
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
    FormatNumberPipe
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class NearBreachConfigurationComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private productsService = inject(ProductsService);
  private dialog = inject(MatDialog);

  nearBreachesData: NearBreach[] = [];
  /** Columns to be displayed in near breaches table. */
  displayedColumns: string[] = [
    'id',
    'name',
    'frequency',
    'threshold',
    'actions'
  ];
  /** Data source for near breaches table. */
  dataSource: MatTableDataSource<NearBreach>;
  /** Paginator for near breaches table. */
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  /** Sorter for near breaches table. */
  @ViewChild(MatSort, { static: true }) sort: MatSort;

  constructor() {
    this.route.data.subscribe((data: { nearBreaches: NearBreach[] }) => {
      this.nearBreachesData = data.nearBreaches ?? [];
    });
  }

  ngOnInit(): void {
    this.dataSource = new MatTableDataSource(this.nearBreachesData);
    this.dataSource.filterPredicate = (data: NearBreach, filter: string) =>
      [
        data.id,
        data.name,
        data.frequency,
        data.frequencyType?.code,
        data.threshold
      ]
        .join(' ')
        .toLowerCase()
        .includes(filter);
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  applyFilter(filterValue: string) {
    this.dataSource.filter = filterValue.trim().toLowerCase();
    this.dataSource.paginator?.firstPage();
  }

  delete(item: NearBreach): void {
    const deleteDataTableDialogRef = this.dialog.open(DeleteDialogComponent, {
      data: { deleteContext: ` the item of ${item.id}` }
    });
    deleteDataTableDialogRef.afterClosed().subscribe((response: any) => {
      if (response?.delete) {
        this.productsService.deleteWrokingCapitalNearBreach(item.id).subscribe(() => {
          this.productsService.getWorkingCapitalNearBreaches().subscribe((nearBreachesData: NearBreach[]) => {
            this.nearBreachesData = nearBreachesData;
            this.dataSource = new MatTableDataSource(this.nearBreachesData);
          });
        });
      }
    });
  }
}
