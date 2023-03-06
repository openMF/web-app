import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StatusLookupPipe } from './status-lookup.pipe';
import { AccountsFilterPipe } from './accounts-filter.pipe';
import { ChargesFilterPipe } from './charges-filter.pipe';
import { ChargesPenaltyFilterPipe } from './charges-penalty-filter.pipe';
import { FindPipe } from './find.pipe';
import { UrlToStringPipe } from './url-to-string.pipe';
import { DateFormatPipe } from './date-format.pipe';
import { DatetimeFormatPipe } from './datetime-format.pipe';
import { ExternalIdentifierPipe } from './external-identifier.pipe';
import { FormatNumberPipe } from './format-number.pipe';

@NgModule({
  imports: [
    CommonModule
  ],
  declarations: [StatusLookupPipe, AccountsFilterPipe, ChargesFilterPipe, ChargesPenaltyFilterPipe, FindPipe, UrlToStringPipe, DateFormatPipe, DatetimeFormatPipe, ExternalIdentifierPipe, FormatNumberPipe ],
  providers: [StatusLookupPipe, AccountsFilterPipe, ChargesFilterPipe, ChargesPenaltyFilterPipe, FindPipe, UrlToStringPipe, DateFormatPipe, DatetimeFormatPipe, ExternalIdentifierPipe, FormatNumberPipe ],
  exports: [StatusLookupPipe, AccountsFilterPipe, ChargesFilterPipe, ChargesPenaltyFilterPipe, FindPipe, UrlToStringPipe, DateFormatPipe, DatetimeFormatPipe, ExternalIdentifierPipe, FormatNumberPipe ]
})
export class PipesModule { }
