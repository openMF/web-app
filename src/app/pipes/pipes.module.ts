/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { AccountsFilterPipe } from './accounts-filter.pipe';
import { ChargesFilterPipe } from './charges-filter.pipe';
import { ChargesPenaltyFilterPipe } from './charges-penalty-filter.pipe';
import { DateFormatPipe } from './date-format.pipe';
import { DatetimeFormatPipe } from './datetime-format.pipe';
import { ExternalIdentifierPipe } from './external-identifier.pipe';
import { FindPipe } from './find.pipe';
import { FormatNumberPipe } from './format-number.pipe';
import { PrettyPrintPipe } from './pretty-print.pipe';
import { StatusLookupPipe } from './status-lookup.pipe';
import { TranslatePipe } from './translate.pipe';
import { TruncateTextPipe } from './truncate-text.pipe';
import { UrlToStringPipe } from './url-to-string.pipe';
import { YesnoPipe } from './yesno.pipe';

@NgModule({
  imports: [
    CommonModule,
    StatusLookupPipe,
    AccountsFilterPipe,
    ChargesFilterPipe,
    ChargesPenaltyFilterPipe,
    FindPipe,
    UrlToStringPipe,
    DateFormatPipe,
    DatetimeFormatPipe,
    ExternalIdentifierPipe,
    FormatNumberPipe,
    YesnoPipe,
    PrettyPrintPipe,
    TruncateTextPipe,
    TranslatePipe
  ],
  providers: [
    StatusLookupPipe,
    AccountsFilterPipe,
    ChargesFilterPipe,
    ChargesPenaltyFilterPipe,
    FindPipe,
    UrlToStringPipe,
    DateFormatPipe,
    DatetimeFormatPipe,
    ExternalIdentifierPipe,
    FormatNumberPipe,
    YesnoPipe,
    PrettyPrintPipe,
    TranslatePipe,
    TruncateTextPipe
  ],
  exports: [
    StatusLookupPipe,
    AccountsFilterPipe,
    ChargesFilterPipe,
    ChargesPenaltyFilterPipe,
    FindPipe,
    UrlToStringPipe,
    DateFormatPipe,
    DatetimeFormatPipe,
    ExternalIdentifierPipe,
    FormatNumberPipe,
    YesnoPipe,
    PrettyPrintPipe,
    TranslatePipe,
    TruncateTextPipe
  ]
})
export class PipesModule {}
