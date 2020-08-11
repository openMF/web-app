/** Angular Imports */
import { Component, OnInit } from '@angular/core';
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
   */
  constructor(private route: ActivatedRoute) {
    this.route.data.subscribe((data: { viewAccountTransferData: any }) => {
      this.viewAccountTransferData = data.viewAccountTransferData;
    });
  }

}
