/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { Component, Input, OnInit, inject } from '@angular/core';
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
  private externalAssetOwner = inject(ExternalAssetOwner);

  /** Input Fields Data */
  @Input() transferData: any;

  itemStatus(status: string): string {
    return this.externalAssetOwner.itemStatus(status);
  }
}
