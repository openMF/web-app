import { Component, Input } from '@angular/core';
import { Accounting } from 'app/core/utils/accounting';
import { OptionData } from 'app/shared/models/option-data.model';
import { NgIf } from '@angular/common';
import { GlAccountDisplayComponent } from '../gl-account-display/gl-account-display.component';
import { TranslatePipe as NgxTranslatePipe } from '@ngx-translate/core';
import { TranslatePipe } from '@pipes/translate.pipe';

@Component({
  selector: 'mifosx-view-savings-accounting-details',
  templateUrl: './view-savings-accounting-details.component.html',
  styleUrls: ['./view-savings-accounting-details.component.scss'],
  imports: [
    NgIf,
    GlAccountDisplayComponent,
    TranslatePipe,
    NgxTranslatePipe
  ]
})
export class ViewSavingsAccountingDetailsComponent {
  @Input() accountingRule: OptionData;
  @Input() accountingMappings: any[] = [];

  constructor(private accounting: Accounting) {}

  isCashOrAccrualAccounting(): boolean {
    if (this.accountingRule) {
      return this.accounting.isCashOrAccrualAccounting(this.accountingRule);
    }
    return false;
  }

  isAccrualAccounting(): boolean {
    if (this.accountingRule) {
      return this.accounting.isAccrualAccounting(this.accountingRule);
    }
    return false;
  }

  getAccountingRuleName(value: string): string {
    return this.accounting.getAccountRuleName(value.toUpperCase());
  }
}
