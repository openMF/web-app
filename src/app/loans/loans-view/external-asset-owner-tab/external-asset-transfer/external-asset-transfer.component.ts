import { Component, Input, OnInit } from '@angular/core';
import { ExternalAssetOwner } from 'app/loans/services/external-asset-owner';
import { NgClass } from '@angular/common';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import { ExternalIdentifierComponent } from '../../../../shared/external-identifier/external-identifier.component';
import { DateFormatPipe } from '../../../../pipes/date-format.pipe';
import { FormatNumberPipe } from '../../../../pipes/format-number.pipe';
import { STANDALONE_SHARED_IMPORTS } from 'app/standalone-shared.module';

@Component({
  selector: 'mifosx-external-asset-transfer',
  templateUrl: './external-asset-transfer.component.html',
  styleUrls: ['./external-asset-transfer.component.scss'],
  imports: [
    ...STANDALONE_SHARED_IMPORTS,
    NgClass,
    FaIconComponent,
    ExternalIdentifierComponent,
    DateFormatPipe,
    FormatNumberPipe
  ]
})
export class ExternalAssetTransferComponent {
  /** Input Fields Data */
  @Input() transferData: any;

  constructor(private externalAssetOwner: ExternalAssetOwner) {}

  itemStatus(status: string): string {
    return this.externalAssetOwner.itemStatus(status);
  }
}
