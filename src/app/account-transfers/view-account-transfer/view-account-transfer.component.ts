/** Angular Imports */
import { Location } from '@angular/common';
import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'mifosx-view-account-transfer',
  templateUrl: './view-account-transfer.component.html',
  styleUrls: ['./view-account-transfer.component.scss']
})
export class ViewAccountTransferComponent {

  viewAccountTransferData: any;
  /**
   * Retrieves the view account transfer data from `resolve`.
   * @param {ActivatedRoute} route Activated Route.
   * @param {Location} location Location.
   */
  constructor(private route: ActivatedRoute,
    private location: Location) {
    this.route.data.subscribe((data: { viewAccountTransferData: any }) => {
      this.viewAccountTransferData = data.viewAccountTransferData;
    });
  }

  transferToClient(toClient: any): string {
    return `/#/clients/${toClient.id}`;
  }

  transferToAccount(toClient: any, toAccount: any): string {
    return `/#/clients/${toClient.id}/savings-accounts/${toAccount.id}`;
  }

  goBack(): void {
    this.location.back();
  }

}
