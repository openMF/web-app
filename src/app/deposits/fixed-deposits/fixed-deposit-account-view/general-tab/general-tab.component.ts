import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Currency } from 'app/shared/models/general.model';
import { NgIf, CurrencyPipe } from '@angular/common';
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
  fixedDepositsAccountData: any;
  entityType: string;
  currency: Currency;

  constructor(
    private route: ActivatedRoute,
    private router: Router
  ) {
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
