/** Angular Imports */
import { Component, OnInit } from '@angular/core';
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
import { ActivatedRoute } from '@angular/router';
import { DateFormatPipe } from '../../../pipes/date-format.pipe';
import { STANDALONE_SHARED_IMPORTS } from 'app/standalone-shared.module';

/**
 * Transactions Tab Component.
 */
@Component({
  selector: 'mifosx-transactions-tab',
  templateUrl: './transactions-tab.component.html',
  styleUrls: ['./transactions-tab.component.scss'],
  imports: [
    ...STANDALONE_SHARED_IMPORTS,
    MatTable,
    MatColumnDef,
    MatHeaderCellDef,
    MatHeaderCell,
    MatCellDef,
    MatCell,
    MatHeaderRowDef,
    MatHeaderRow,
    MatRowDef,
    MatRow,
    DateFormatPipe
  ]
})
export class TransactionsTabComponent implements OnInit {
  /** Shares Account Data */
  shareAccountData: any;
  /** Transactions Data */
  transactionsData: any;
  /** Data source for transactions table. */
  dataSource: MatTableDataSource<any>;
  /** Columns to be displayed in transactions table. */
  displayedColumns: string[] = [
    'transactionDate',
    'transactionType',
    'totalShares',
    'purchasedOrRedeemedPrice',
    'chargeAmount',
    'amountRecievedOrReturned'
  ];

  /**
   * Retrieves shares account data from `resolve`.
   * @param {ActivatedRoute} route Activated Route.
   */
  constructor(private route: ActivatedRoute) {
    this.route.parent.data.subscribe((data: { sharesAccountData: any }) => {
      this.shareAccountData = data.sharesAccountData;
      this.transactionsData = this.shareAccountData.purchasedShares;
    });
  }

  ngOnInit() {
    this.dataSource = new MatTableDataSource(this.transactionsData);
  }
}
