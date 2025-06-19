/** Angular Imports */
import { Component } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ClientsService } from 'app/clients/clients.service';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import { MatCard, MatCardTitle, MatCardContent, MatCardActions } from '@angular/material/card';
import { NgClass, NgIf } from '@angular/common';
import { MatDivider } from '@angular/material/divider';
import {
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
import { StatusLookupPipe } from '../../../../pipes/status-lookup.pipe';
import { DateFormatPipe } from '../../../../pipes/date-format.pipe';
import { FormatNumberPipe } from '../../../../pipes/format-number.pipe';
import { STANDALONE_SHARED_IMPORTS } from 'app/standalone-shared.module';

/**
 * View Charge component.
 */
@Component({
  selector: 'mifosx-view-charge',
  templateUrl: './view-charge.component.html',
  styleUrls: ['./view-charge.component.scss'],
  imports: [
    ...STANDALONE_SHARED_IMPORTS,
    FaIconComponent,
    MatCardTitle,
    NgClass,
    MatDivider,
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
    StatusLookupPipe,
    DateFormatPipe,
    FormatNumberPipe
  ]
})
export class ViewChargeComponent {
  /** Charge Data. */
  chargeData: any;
  /** Mat Table Column defs. */
  viewChargeTableColumns: string[] = [
    'id',
    'officeName',
    'type',
    'transactionDate',
    'amount',
    'actions'
  ];

  /**
   * Retrieves the selected job data from `resolve`.
   * @param {ActivatedRoute} route Activated Route.
   * @param {Router} router Router for navigation.
   */
  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private clientService: ClientsService
  ) {
    this.route.data.subscribe((data: { clientChargeData: any }) => {
      this.chargeData = data.clientChargeData;
    });
  }

  /**
   * Waive Charge.
   */
  waiveCharge() {
    const waiveChargeObj = { clientId: this.chargeData.clientId, resourceType: this.chargeData.id };
    this.clientService.waiveClientCharge(waiveChargeObj).subscribe(() => {
      this.getChargeData();
    });
  }

  /**
   * Undo Transaction.
   */
  undoTransaction(transactionId: any) {
    const transactionData = { clientId: this.chargeData.clientId.toString(), transactionId: transactionId };
    this.clientService.undoTransaction(transactionData).subscribe(() => {
      this.getChargeData();
    });
  }

  /**
   * Get Charge Data.
   */
  getChargeData() {
    this.clientService.getSelectedChargeData(this.chargeData.clientId, this.chargeData.id).subscribe((data: any) => {
      this.chargeData = data;
    });
  }

  /**
   * Delete Charge.
   */
  deleteCharge() {
    this.clientService.deleteCharge(this.chargeData.clientId, this.chargeData.id).subscribe(() => {
      this.router.navigate([
        '../../clients',
        this.chargeData.clientId,
        'general'
      ]);
    });
  }
}
