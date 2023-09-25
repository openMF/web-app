import { Component, Input, OnInit } from '@angular/core';
import { ExternalAssetOwner } from 'app/loans/services/external-asset-owner';

@Component({
  selector: 'mifosx-external-asset-transfer',
  templateUrl: './external-asset-transfer.component.html',
  styleUrls: ['./external-asset-transfer.component.scss']
})
export class ExternalAssetTransferComponent {
  /** Input Fields Data */
  @Input() transferData: any;

  constructor(private externalAssetOwner: ExternalAssetOwner) { }

  itemStatus(status: string): string {
    return this.externalAssetOwner.itemStatus(status);
  }

}
