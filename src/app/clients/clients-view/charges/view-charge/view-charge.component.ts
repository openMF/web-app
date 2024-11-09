/** Angular Imports */
import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ClientsService } from 'app/clients/clients.service';

/**
 * View Charge component.
 */
@Component({
  selector: 'mifosx-view-charge',
  templateUrl: './view-charge.component.html',
  styleUrls: ['./view-charge.component.scss']
})
export class ViewChargeComponent {

  /** Charge Data. */
  chargeData: any;
  /** Mat Table Column defs. */
  viewChargeTableColumns: string[] = ['id', 'officeName', 'type', 'transactionDate', 'amount', 'actions'];

  /**
   * Retrieves the selected job data from `resolve`.
   * @param {ActivatedRoute} route Activated Route.
   * @param {Router} router Router for navigation.
   */
  constructor(private route: ActivatedRoute,
              private router: Router,
              private clientService: ClientsService) {
    this.route.data.subscribe((data: { clientChargeData: any }) => {
      this.chargeData = data.clientChargeData;
    });
   }

  /**
   * Waive Charge.
   */
  waiveCharge() {
    const waiveChargeObj = { clientId: this.chargeData.clientId, resourceType: this.chargeData.id};
    this.clientService.waiveClientCharge(waiveChargeObj).subscribe(() => {
      this.getChargeData();
    });
  }

  /**
   * Undo Transaction.
   */
  undoTransaction(transactionId: any) {
    const transactionData = { clientId: this.chargeData.clientId.toString(), transactionId: transactionId};
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
      this.router.navigate(['../../clients', this.chargeData.clientId, 'general']);
    });
  }

}
