import { Injectable } from '@angular/core';
import { OptionData } from 'app/shared/models/option-data.model';

@Injectable({
  providedIn: 'root'
})
export class Charges {
  public getChargeAppliesToOptions(): OptionData[] {
    return [
      { id: 1, code: 'chargeAppliesTo.loan', value: 'Loan' },
      { id: 2, code: 'chargeAppliesTo.savings', value: 'Savings' },
      { id: 3, code: 'chargeAppliesTo.client', value: 'Client' },
      { id: 4, code: 'chargeAppliesTo.shares', value: 'Shares' }
    ];
  }
}
