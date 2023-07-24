import { Injectable } from '@angular/core';
import { SettingsService } from 'app/settings/settings.service';
import { GlobalConfiguration } from 'app/system/configurations/global-configurations-tab/configuration.model';

@Injectable({
  providedIn: 'root'
})
export class LoanProducts {

  globalConfigurations: string[] = ['days-before-repayment-is-due', 'days-after-repayment-is-overdue'];
  propertyNames: string[] = ['dueDaysForRepaymentEvent', 'overDueDaysForRepaymentEvent'];

  constructor(private settingsService: SettingsService) { }

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
    return (this.propertyNames.includes(propertyName));
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
