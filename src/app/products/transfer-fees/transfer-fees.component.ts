/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

/** Angular Imports */
import { AfterViewInit, ChangeDetectionStrategy, Component, OnInit, ViewChild, inject } from '@angular/core';
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
import { ActivatedRoute, Router } from '@angular/router';

/** Custom Imports */
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import { FormatNumberPipe } from '@pipes/format-number.pipe';
import { STANDALONE_SHARED_IMPORTS } from 'app/standalone-shared.module';
import {
  TRANSFER_FEE_TRANSFER_MODES,
  TRANSFER_FEE_TRANSFER_TYPES,
  TRANSFER_FEE_TYPES,
  TransferFee,
  TransferFeeOption
} from './models/transfer-fee.model';

/**
 * Transfer fees component.
 */
@Component({
  selector: 'mifosx-transfer-fees',
  templateUrl: './transfer-fees.component.html',
  styleUrls: ['./transfer-fees.component.scss'],
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
    FormatNumberPipe
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TransferFeesComponent implements OnInit, AfterViewInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  /** Transfer fee data. */
  transferFeesData: TransferFee[] = [];
  /** Columns to be displayed in transfer fees table. */
  displayedColumns: string[] = [
    'transferType',
    'currencyCode',
    'transferMode',
    'feeType',
    'feeValue',
    'feeCurrency',
    'exchangeRateRequired',
    'active'
  ];
  /** Data source for transfer fees table. */
  dataSource!: MatTableDataSource<TransferFee>;

  /** Paginator for transfer fees table. */
  @ViewChild(MatPaginator, { static: true }) paginator!: MatPaginator;
  /** Sorter for transfer fees table. */
  @ViewChild(MatSort, { static: true }) sort!: MatSort;

  constructor() {
    this.route.data.subscribe((data: { transferFees: TransferFee[] }) => {
      this.transferFeesData = data.transferFees || [];
    });
  }

  /**
   * Sets the transfer fees table.
   */
  ngOnInit(): void {
    this.dataSource = new MatTableDataSource(this.transferFeesData);
    this.dataSource.filterPredicate = (transferFee: TransferFee, filter: string) =>
      [
        transferFee.transferType,
        transferFee.currencyCode,
        transferFee.transferMode,
        transferFee.feeType,
        transferFee.feeValue,
        transferFee.feeCurrency,
        transferFee.thresholdAmount,
        transferFee.thresholdFeeValue,
        transferFee.description
      ]
        .join(' ')
        .toLowerCase()
        .includes(filter);
    this.dataSource.sortingDataAccessor = (transferFee: TransferFee, property: string) => {
      switch (property) {
        case 'active':
          return this.isActive(transferFee) ? 1 : 0;
        default:
          return transferFee[property as keyof TransferFee] as string | number;
      }
    };
  }

  /**
   * Initializes the data source paginator and sorter.
   */
  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  /**
   * Filters data in transfer fees table based on passed value.
   * @param {string} filterValue Value to filter data.
   */
  applyFilter(filterValue: string): void {
    this.dataSource.filter = filterValue.trim().toLowerCase();
    this.dataSource.paginator?.firstPage();
  }

  /**
   * Navigates to the selected transfer fee.
   * @param {number} transferFeeId Transfer fee identifier.
   */
  navigateToTransferFee(transferFeeId: number | undefined): void {
    if (transferFeeId) {
      this.router.navigate([transferFeeId], { relativeTo: this.route });
    }
  }

  /**
   * @param {TransferFee} transferFee Transfer fee.
   * @returns {boolean} Transfer fee active flag.
   */
  isActive(transferFee: TransferFee): boolean {
    return transferFee.isActive === true;
  }

  /**
   * @param {string} value Option value.
   * @param {TransferFeeOption[]} options Options list.
   * @returns {string} Option label key.
   */
  optionLabelKey(value: string | null | undefined, options: TransferFeeOption[]): string {
    return options.find((option: TransferFeeOption) => option.value === value)?.labelKey || value || '-';
  }

  transferTypeLabelKey(value: string): string {
    return this.optionLabelKey(value, TRANSFER_FEE_TRANSFER_TYPES);
  }

  transferModeLabelKey(value: string | null | undefined): string {
    return this.optionLabelKey(value, TRANSFER_FEE_TRANSFER_MODES);
  }

  feeTypeLabelKey(value: string): string {
    return this.optionLabelKey(value, TRANSFER_FEE_TYPES);
  }
}
