import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Currency } from 'app/shared/models/general.model';
import { NgIf, CurrencyPipe } from '@angular/common';
import { ExternalIdentifierComponent } from '../../../shared/external-identifier/external-identifier.component';
import { HasPermissionDirective } from '../../../directives/has-permission/has-permission.directive';
import { TranslatePipe as NgxTranslatePipe } from '@ngx-translate/core';
import { TranslatePipe } from '@pipes/translate.pipe';
import { DateFormatPipe } from '../../../pipes/date-format.pipe';
import { FormatNumberPipe } from '../../../pipes/format-number.pipe';
import { YesnoPipe } from '../../../pipes/yesno.pipe';

@Component({
  selector: 'mifosx-general-tab',
  templateUrl: './general-tab.component.html',
  styleUrls: ['./general-tab.component.scss'],
  imports: [
    NgIf,
    ExternalIdentifierComponent,
    HasPermissionDirective,
    CurrencyPipe,
    TranslatePipe,
    DateFormatPipe,
    FormatNumberPipe,
    YesnoPipe,
    NgxTranslatePipe
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
