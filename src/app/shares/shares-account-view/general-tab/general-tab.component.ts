import { Component, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ExternalIdentifierComponent } from '../../../shared/external-identifier/external-identifier.component';
import { AccountNumberComponent } from '../../../shared/account-number/account-number.component';
import { DateFormatPipe } from '../../../pipes/date-format.pipe';
import { FormatNumberPipe } from '../../../pipes/format-number.pipe';
import { STANDALONE_SHARED_IMPORTS } from 'app/standalone-shared.module';

@Component({
  selector: 'mifosx-general-tab',
  templateUrl: './general-tab.component.html',
  styleUrls: ['./general-tab.component.scss'],
  imports: [
    ...STANDALONE_SHARED_IMPORTS,
    ExternalIdentifierComponent,
    AccountNumberComponent,
    DateFormatPipe,
    FormatNumberPipe
  ]
})
export class GeneralTabComponent {
  private route = inject(ActivatedRoute);

  /** Shares Account Data */
  sharesAccountData: any;

  /**
   * Fetches shares account data from `resolve`
   * @param {ActivatedRoute} route Activated Route
   */
  constructor() {
    this.route.data.subscribe((data: { sharesAccountData: any }) => {
      this.sharesAccountData = data.sharesAccountData;
    });
  }
}
