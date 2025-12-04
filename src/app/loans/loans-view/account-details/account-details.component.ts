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
