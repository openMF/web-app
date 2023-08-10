import { Component, Input, OnInit } from '@angular/core';
import { ExternalAssetOwner } from 'app/loans/services/external-asset-owner';

@Component({
  selector: 'mifosx-external-asset-transfer',
  templateUrl: './external-asset-transfer.component.html',
  styleUrls: ['./external-asset-transfer.component.scss']
})
export class ExternalAssetTransferComponent implements OnInit {
  /** Input Fields Data */
  @Input() transferData: any;

  constructor(private externalAssetOwner: ExternalAssetOwner) { }

  ngOnInit(): void {
    console.log(this.transferData);
  }

  itemStatus(status: string): string {
    return this.externalAssetOwner.itemStatus(status);
  }

}
