/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { Component, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { DateFormatPipe } from '../../../pipes/date-format.pipe';
import { FormatNumberPipe } from '../../../pipes/format-number.pipe';
import { YesnoPipe } from '../../../pipes/yesno.pipe';
import { STANDALONE_SHARED_IMPORTS } from 'app/standalone-shared.module';

@Component({
  selector: 'mifosx-account-details',
  templateUrl: './account-details.component.html',
  styleUrls: ['./account-details.component.scss'],
  imports: [
    ...STANDALONE_SHARED_IMPORTS,
    DateFormatPipe,
    FormatNumberPipe,
    YesnoPipe
  ]
})
export class AccountDetailsComponent {
  private route = inject(ActivatedRoute);

  loanDetails: any;
  dataObject: {
    property: string;
    value: string;
  }[];

  constructor() {
    this.route.parent.data.subscribe((data: { loanDetailsData: any }) => {
      this.loanDetails = data.loanDetailsData;
    });
  }
}
