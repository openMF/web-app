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
import { NgIf, CurrencyPipe } from '@angular/common';
import { HasPermissionDirective } from '../../../directives/has-permission/has-permission.directive';
import { MatButton } from '@angular/material/button';
import { MatTooltip } from '@angular/material/tooltip';
import { TranslatePipe as NgxTranslatePipe } from '@ngx-translate/core';
import { TranslatePipe } from '@pipes/translate.pipe';

/**
 * Charges Tab Component
 */
@Component({
  selector: 'mifosx-charges-tab',
  templateUrl: './charges-tab.component.html',
  styleUrls: ['./charges-tab.component.scss'],
  imports: [
    MatTable,
    MatColumnDef,
    MatHeaderCellDef,
    MatHeaderCell,
    MatCellDef,
    MatCell,
    NgIf,
    HasPermissionDirective,
    MatButton,
    MatTooltip,
    MatHeaderRowDef,
    MatHeaderRow,
    MatRowDef,
    MatRow,
    CurrencyPipe,
    TranslatePipe,
    NgxTranslatePipe
  ]
})
export class ChargesTabComponent implements OnInit {
  /** Shares Account Data */
  sharesAccountData: any;
  /** Charges Data */
  chargesData: any[];
  /** Data source for charges table. */
  dataSource: MatTableDataSource<any>;
  /** Columns to be displayed in charges table. */
  displayedColumns: string[] = [
    'name',
    'feeOrPenalty',
    'paymentDueAt',
    'calculationType',
    'due',
    'paid',
    'waived',
    'outstanding',
    'actions'
  ];

  /**
   * Retrieves shares account aata from `resolve`.
   * @param {ActivatedRoute} route Activated Route.
   */
  constructor(private route: ActivatedRoute) {
    this.route.parent.data.subscribe((data: { sharesAccountData: any }) => {
      this.sharesAccountData = data.sharesAccountData;
      this.chargesData = this.sharesAccountData.charges;
    });
  }

  ngOnInit() {
    const activeCharges = this.chargesData ? this.chargesData.filter((charge) => charge.isActive) : [];
    this.dataSource = new MatTableDataSource(activeCharges);
  }
}
