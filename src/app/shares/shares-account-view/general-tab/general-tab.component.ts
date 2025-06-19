import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { NgIf } from '@angular/common';
import { ExternalIdentifierComponent } from '../../../shared/external-identifier/external-identifier.component';
import { AccountNumberComponent } from '../../../shared/account-number/account-number.component';
import { TranslatePipe as NgxTranslatePipe } from '@ngx-translate/core';
import { DateFormatPipe } from '../../../pipes/date-format.pipe';
import { FormatNumberPipe } from '../../../pipes/format-number.pipe';

@Component({
  selector: 'mifosx-general-tab',
  templateUrl: './general-tab.component.html',
  styleUrls: ['./general-tab.component.scss'],
  imports: [
    NgIf,
    ExternalIdentifierComponent,
    AccountNumberComponent,
    DateFormatPipe,
    FormatNumberPipe,
    NgxTranslatePipe
  ]
})
export class GeneralTabComponent {
  /** Shares Account Data */
  sharesAccountData: any;

  /**
   * Fetches shares account data from `resolve`
   * @param {ActivatedRoute} route Activated Route
   */
  constructor(private route: ActivatedRoute) {
    this.route.data.subscribe((data: { sharesAccountData: any }) => {
      this.sharesAccountData = data.sharesAccountData;
    });
  }
}
