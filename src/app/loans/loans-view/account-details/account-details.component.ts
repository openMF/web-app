import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { NgIf } from '@angular/common';
import { TranslatePipe as NgxTranslatePipe } from '@ngx-translate/core';
import { TranslatePipe } from '@pipes/translate.pipe';
import { DateFormatPipe } from '../../../pipes/date-format.pipe';
import { FormatNumberPipe } from '../../../pipes/format-number.pipe';
import { YesnoPipe } from '../../../pipes/yesno.pipe';

@Component({
  selector: 'mifosx-account-details',
  templateUrl: './account-details.component.html',
  styleUrls: ['./account-details.component.scss'],
  imports: [
    NgIf,
    TranslatePipe,
    DateFormatPipe,
    FormatNumberPipe,
    YesnoPipe,
    NgxTranslatePipe
  ]
})
export class AccountDetailsComponent {
  loanDetails: any;
  dataObject: {
    property: string;
    value: string;
  }[];

  constructor(private route: ActivatedRoute) {
    this.route.parent.data.subscribe((data: { loanDetailsData: any }) => {
      this.loanDetails = data.loanDetailsData;
    });
  }
}
