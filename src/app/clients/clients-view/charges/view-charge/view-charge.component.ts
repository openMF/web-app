/** Angular Imports */
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ClientsService } from 'app/clients/clients.service';

/** Custom Services. */
import { AuthenticationService } from '../../../../core/authentication/authentication.service';
import { MatomoTracker } from 'ngx-matomo';

/**
 * View Charge component.
 */
@Component({
  selector: 'mifosx-view-charge',
  templateUrl: './view-charge.component.html',
  styleUrls: ['./view-charge.component.scss']
})
export class ViewChargeComponent implements OnInit {

  /** Charge Data. */
  chargeData: any;
  /** Mat Table Column defs. */
  viewChargeTableColumns: string[] = ['id', 'officeName', 'type', 'transactionDate', 'amount', 'actions'];

  /**
   * Retrieves the selected job data from `resolve`.
   * @param {ActivatedRoute} route Activated Route.
   * @param {Router} router Router for navigation.
   * @param {AuthenticationService} authenticationService Authentication service.
   * @param {MatomoTracker} matomoTracker Matomo tracker service
   */
  constructor(private route: ActivatedRoute,
    private router: Router,
    private clientService: ClientsService,
    private authenticationService: AuthenticationService,
    private matomoTracker: MatomoTracker
  ) {
    this.route.data.subscribe((data: { clientChargeData: any }) => {
      this.chargeData = data.clientChargeData;
    });
  }

  ngOnInit() {

    //set Matomo page info
    let title = document.title;
    let userName = this.authenticationService.getConnectedUsername() ? this.authenticationService.getConnectedUsername() : "";

    this.matomoTracker.setUserId(userName); //tracker user ID
    this.matomoTracker.setDocumentTitle(`${title}`);
  }

  /**
   * Waive Charge.
   */
  waiveCharge() {
    const waiveChargeObj = { clientId: this.chargeData.clientId, resourceType: this.chargeData.id };
    this.clientService.waiveClientCharge(waiveChargeObj).subscribe(() => {
      this.getChargeData();
    });

    //Track Matomo event for waiving client charge
    this.matomoTracker.trackEvent('clients', 'waive.charges', this.chargeData.id);
  }

  /**
   * Undo Transaction.
   */
  undoTransaction(transactionId: any) {
    const transactionData = { clientId: this.chargeData.clientId.toString(), transactionId: transactionId };
    this.clientService.undoTransaction(transactionData).subscribe(() => {
      this.getChargeData();
    });

    //Track Matomo event for undoing client charge
    this.matomoTracker.trackEvent('clients', 'undo.charges', transactionId);
  }

  /**
   * Get Charge Data.
   */
  getChargeData() {
    this.clientService.getSelectedChargeData(this.chargeData.clientId, this.chargeData.id).subscribe((data: any) => {
      this.chargeData = data;
    });

    //Track Matomo event for listing client charge info
    this.matomoTracker.trackEvent('clients', 'view.charges', this.chargeData.id);
  }

  /**
   * Delete Charge.
   */
  deleteCharge() {
    this.clientService.deleteCharge(this.chargeData.clientId, this.chargeData.id).subscribe(() => {
      this.router.navigate(['../../clients', this.chargeData.clientId, 'general']);
    });

    //Track Matomo event for deleting client charge
    this.matomoTracker.trackEvent('clients', 'delete.charges', this.chargeData.id);

  }

}
