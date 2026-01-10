/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { Component, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Currency } from 'app/shared/models/general.model';
import { CurrencyPipe } from '@angular/common';
import { ExternalIdentifierComponent } from '../../../../shared/external-identifier/external-identifier.component';
import { DateFormatPipe } from '../../../../pipes/date-format.pipe';
import { STANDALONE_SHARED_IMPORTS } from 'app/standalone-shared.module';

@Component({
  selector: 'mifosx-general-tab',
  templateUrl: './general-tab.component.html',
  styleUrls: ['./general-tab.component.scss'],
  imports: [
    ...STANDALONE_SHARED_IMPORTS,
    ExternalIdentifierComponent,
    CurrencyPipe,
    DateFormatPipe
  ]
})
export class GeneralTabComponent {
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  fixedDepositsAccountData: any;
  entityType: string;
  currency: Currency;

  constructor() {
    this.route.parent.data.subscribe((data: { fixedDepositsAccountData: any }) => {
      this.fixedDepositsAccountData = data.fixedDepositsAccountData;
      this.currency = this.fixedDepositsAccountData.currency;
    });
    if (this.router.url.includes('clients')) {
      this.entityType = 'Client';
    } else if (this.router.url.includes('groups')) {
      this.entityType = 'Group';
    } else if (this.router.url.includes('centers')) {
      this.entityType = 'Center';
    }
  }
}
