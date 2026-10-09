/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { Injectable, inject } from '@angular/core';
import { SettingsService } from 'app/settings/settings.service';
import { GlobalConfiguration } from 'app/system/configurations/global-configurations-tab/configuration.model';
import { LoanProductService } from './services/loan-product.service';

@Injectable({
  providedIn: 'root'
})
export class LoanProducts {
  private settingsService = inject(SettingsService);
  private loanProductService = inject(LoanProductService);

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

    const loanProduct = this.loanProductService.isLoanProduct
      ? {
          ...loanProductData,
          charges: (loanProductData.charges || []).map((charge: any) => ({ id: charge.id })),
          dateFormat,
          locale
        }
      : {
          ...loanProductData,
          dateFormat,
          locale
        };
    // Remove unnecessary properties
    delete loanProduct.allowAttributeConfiguration;
    delete loanProduct.advancedAccountingRules;

    // `allowPartialPeriodInterestCalculation` is sent through UNCHANGED, and must stay that way.
    //
    // History, because this field has now been broken in both directions: Fineract used to accept the
    // misspelled `allowPartialPeriodInterestCalcualtion` ("Calcualtion"), so this method used to
    // re-key the payload to that name. Fineract fixed the typo in FINERACT-2206 (commit ab9f4fd4,
    // 2026-01-02) — the constant is still NAMED
    // `ALLOW_PARTIAL_PERIOD_INTEREST_CALCUALTION_PARAM_NAME`, but its value is now the correct
    // spelling — and #2993 dropped the re-key here 11 days later to match. Sending the misspelled
    // name to a current backend fails with
    // "[allowPartialPeriodInterestCalcualtion] ... unsupported parameter".
    //
    // #2993 did that by making both sides of the assignment identical, which left `x = x; delete x`
    // and silently stripped the field from every create/update payload instead. That in turn made
    // Fineract default the flag to false and reject `isInterestRecalculationEnabled` on any product
    // using "Same as repayment period", with
    // "[isInterestRecalculationEnabled] not.supported.for.selected.interest.calculation.type".
    // Removing the dead statements entirely is what #2993 intended; see loan-products.spec.ts.

    // Set Default values If they were not set
    if (this.loanProductService.isLoanProduct) {
      itemsByDefault.forEach((config: GlobalConfiguration) => {
        const propertyName = this.resolvePropertyName(config.name);
        if (propertyName !== '') {
          if (!loanProduct[propertyName] || loanProduct[propertyName] === '') {
            loanProduct[propertyName] = config.value;
          }
        }
      });
    }

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
