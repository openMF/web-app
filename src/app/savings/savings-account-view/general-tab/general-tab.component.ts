import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Currency } from 'app/shared/models/general.model';
import { NgIf, CurrencyPipe } from '@angular/common';
import { ExternalIdentifierComponent } from '../../../shared/external-identifier/external-identifier.component';
import { DateFormatPipe } from '../../../pipes/date-format.pipe';
import { FormatNumberPipe } from '../../../pipes/format-number.pipe';
import { YesnoPipe } from '../../../pipes/yesno.pipe';
import { STANDALONE_SHARED_IMPORTS } from 'app/standalone-shared.module';

@Component({
  selector: 'mifosx-general-tab',
  templateUrl: './general-tab.component.html',
  styleUrls: ['./general-tab.component.scss'],
  imports: [
    ...STANDALONE_SHARED_IMPORTS,
    ExternalIdentifierComponent,
    CurrencyPipe,
    DateFormatPipe,
    FormatNumberPipe,
    YesnoPipe
  ]
})
export class GeneralTabComponent {
  isLoading = true;
  isActive = false;
  entityType: string;

  savingsAccountData: any;
  currency: Currency;

  constructor(
    private route: ActivatedRoute,
    private router: Router
  ) {
    this.route.parent.parent.data.subscribe((data: { savingsAccountData: any }) => {
      this.savingsAccountData = data.savingsAccountData;
      this.currency = this.savingsAccountData.currency;
      this.isLoading = false;
      const status = this.savingsAccountData.status.value;
      this.isActive = status === 'Active';
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
