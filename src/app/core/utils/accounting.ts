import { Injectable } from '@angular/core';
import { AccountingMapping, GLAccount } from 'app/shared/models/general.model';
import { OptionData } from 'app/shared/models/option-data.model';

@Injectable({
  providedIn: 'root'
})
export class Accounting {
  public getAccountingRulesForShares(): string[] {
    return [
      'NONE',
      'Cash'
    ];
  }

  public getAccountingRulesForSavings(): string[] {
    return [
      'NONE',
      'Cash',
      'Accrual (periodic)'
    ];
  }

  public getAccountingRulesForLoans(): string[] {
    return [
      'NONE',
      'Cash',
      'Accrual (periodic)',
      'Accrual (upfront)'
    ];
  }

  public getAccountRuleName(value: string): string {
    if ([
        'ACCRUAL PERIODIC',
        'ACCRUAL (PERIODIC)'
      ].includes(value)) {
      return 'Accrual (periodic)';
    } else if ([
        'ACCRUAL UPFRONT',
        'ACCRUAL (UPFRONT)'
      ].includes(value)) {
      return 'Accrual (upfront)';
    } else if (value.startsWith('CASH')) {
      return 'Cash';
    } else if (value === 'NONE') {
      return 'NONE';
    }
    return '';
  }

  public isNoneAccounting(accountingRule: OptionData): boolean {
    return accountingRule.id === 1;
  }

  public isNoneAccountingRuleId(accountingRuleId: number): boolean {
    return accountingRuleId === 1;
  }

  public isCashOrAccrualAccounting(accountingRule: OptionData): boolean {
    return accountingRule.id === 2 || accountingRule.id === 3;
  }

  public isCashOrAccrualAccountingRuleId(accountingRuleId: number): boolean {
    return accountingRuleId === 2 || accountingRuleId === 3;
  }

  public isAccrualAccounting(accountingRule: OptionData): boolean {
    return accountingRule.id === 3;
  }

  public isAccrualAccountingRuleId(accountingRuleId: number): boolean {
    return accountingRuleId === 3;
  }

  public getAccountingRuleFrom(accountingRuleId: number): OptionData {
    if (accountingRuleId === 1) {
      return { code: 'NONE', id: accountingRuleId, value: 'None' };
    } else if (accountingRuleId === 2) {
      return { code: 'CASH', id: accountingRuleId, value: 'Cash' };
    } else if (accountingRuleId === 3) {
      return { code: 'ACCRUAL_PERIODIC', id: accountingRuleId, value: 'Accural (periodic)' };
    } else if (accountingRuleId === 4) {
      return { code: 'ACCRUAL_UPFRONT', id: accountingRuleId, value: 'Accural (upfront)' };
    }
    return { code: 'INVALID', id: accountingRuleId, value: 'Invalid' };
  }

  public glAccountLookUp(glAccountId: number, glAccounts: GLAccount[]): AccountingMapping {
    let accountMapping: AccountingMapping | null = null;
    if (glAccountId) {
      glAccounts.some((glAccount: GLAccount) => {
        if (glAccount.id === glAccountId) {
          accountMapping = { id: glAccount.id, name: glAccount.name, glCode: glAccount.glCode };
        }
      });
    }
    return accountMapping;
  }
}
