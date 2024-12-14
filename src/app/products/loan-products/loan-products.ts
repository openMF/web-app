import { Injectable } from '@angular/core';
import { SettingsService } from 'app/settings/settings.service';
import { GlobalConfiguration } from 'app/system/configurations/global-configurations-tab/configuration.model';

@Injectable({
  providedIn: 'root'
})
export class LoanProducts {
  public static LOAN_SCHEDULE_TYPE_CUMULATIVE = 'CUMULATIVE';
  public static LOAN_SCHEDULE_TYPE_PROGRESSIVE = 'PROGRESSIVE';

  public static LOAN_SCHEDULE_PROCESSING_TYPE_HORIZONTAL = 'HORIZONTAL';
  public static LOAN_SCHEDULE_PROCESSING_TYPE_VERTICAL = 'VERTICAL';

  public static ADVANCED_PAYMENT_ALLOCATION_STRATEGY = 'advanced-payment-allocation-strategy';

  public static DAYS_BEFORE_REPAYMENT_IS_DUE = 'days-before-repayment-is-due';
  public static DAYS_AFTER_REPAYMENT_IS_OVERDUE = 'days-after-repayment-is-overdue';

  globalConfigurations: string[] = [
    LoanProducts.DAYS_BEFORE_REPAYMENT_IS_DUE,
    LoanProducts.DAYS_AFTER_REPAYMENT_IS_OVERDUE
  ];
  propertyNames: string[] = [
    'dueDaysForRepaymentEvent',
    'overDueDaysForRepaymentEvent'
  ];

  public static isAdvancedPaymentAllocationStrategy(code: string): boolean {
    return code === this.ADVANCED_PAYMENT_ALLOCATION_STRATEGY;
  }

  constructor(private settingsService: SettingsService) {}

  public setItemsByDefault(configurations: any) {
    const itemsByDefault: GlobalConfiguration[] = [];
    configurations.globalConfiguration.forEach((config: GlobalConfiguration) => {
      if (this.globalConfigurations.includes(config.name)) {
        itemsByDefault.push(config);
      }
    });
    return itemsByDefault;
  }

  public updateLoanProductDefaults(loanProductTemplate: any, isForUpdate: boolean) {
    const itemsByDefault: GlobalConfiguration[] = loanProductTemplate['itemsByDefault'];
    itemsByDefault.forEach((config: GlobalConfiguration) => {
      const propertyName = this.resolvePropertyName(config.name);
      if (propertyName !== '') {
        if (isForUpdate) {
          if (!loanProductTemplate[propertyName] || loanProductTemplate[propertyName] === '') {
            loanProductTemplate[propertyName] = config.value;
          }
        } else {
          loanProductTemplate[propertyName] = config.value;
        }
      }
    });
    return loanProductTemplate;
  }

  public buildPayload(loanProductData: any, itemsByDefault: any) {
    const dateFormat: string = this.settingsService.dateFormat;
    const locale: string = this.settingsService.language.code;

    const loanProduct = {
      ...loanProductData,
      charges: loanProductData.charges.map((charge: any) => ({ id: charge.id })),
      dateFormat,
      locale
    };
    // Remove unnecessary properties
    delete loanProduct.allowAttributeConfiguration;
    delete loanProduct.advancedAccountingRules;

    // In Fineract, the POST and PUT endpoints for /v1/loanproducts have a typo in the field
    // allowPartialPeriodInterestCalculation. Until that is fixed, we need to replace the field name in the payload.
    loanProduct.allowPartialPeriodInterestCalcualtion = loanProduct.allowPartialPeriodInterestCalculation;
    delete loanProduct.allowPartialPeriodInterestCalculation;

    // Set Default values If they were not set
    itemsByDefault.forEach((config: GlobalConfiguration) => {
      const propertyName = this.resolvePropertyName(config.name);
      if (propertyName !== '') {
        if (!loanProduct[propertyName] || loanProduct[propertyName] === '') {
          loanProduct[propertyName] = config.value;
        }
      }
    });

    return loanProduct;
  }

  public isItemByDefault(propertyName: string): boolean {
    return this.propertyNames.includes(propertyName);
  }

  public isGlobalConfigurations(propertyName: string): boolean {
    return this.globalConfigurations.includes(propertyName);
  }

  private resolvePropertyName(configName: string): string {
    if (this.globalConfigurations.includes(configName)) {
      const idx = this.globalConfigurations.indexOf(configName);
      if (idx > -1) {
        return this.propertyNames[idx];
      }
    }
    return '';
  }
}
