/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import {
  AdvancedCreditAllocation,
  AdvancedPaymentStrategy,
  CreditAllocationOrder,
  CreditAllocationStrategies
} from './payment-allocation-model';

describe('AdvancedPaymentStrategy credit allocation strategy', () => {
  const strategy = new AdvancedPaymentStrategy();
  const chargeback = { id: 1, code: 'CHARGEBACK', value: 'Chargeback' };
  const allocationTypes: any[] = [
    { id: 1, code: 'PENALTY', value: 'Penalty' },
    { id: 2, code: 'FEE', value: 'Fee' },
    { id: 3, code: 'PRINCIPAL', value: 'Principal' },
    { id: 4, code: 'INTEREST', value: 'Interest' }
  ];
  const strategyOptions = [
    { id: 1, code: 'RULE_BASED', value: 'Rule based' },
    { id: 2, code: 'PRINCIPAL_ONLY', value: 'Principal only' }
  ];

  const advancedCreditAllocation = (creditAllocationStrategy: string): AdvancedCreditAllocation => ({
    transaction: chargeback,
    creditAllocationOrder: allocationTypes as CreditAllocationOrder[],
    creditAllocationStrategy,
    creditAllocationStrategyOptions: strategyOptions
  });

  it('sends PRINCIPAL_ONLY without creditAllocationOrder', () => {
    expect(
      strategy.buildCreditAllocations([advancedCreditAllocation(CreditAllocationStrategies.PRINCIPAL_ONLY)])
    ).toEqual([
      { transactionType: 'CHARGEBACK', creditAllocationStrategy: 'PRINCIPAL_ONLY' }
    ]);
  });

  it('sends RULE_BASED with the ordered allocation rules', () => {
    expect(strategy.buildCreditAllocations([advancedCreditAllocation(CreditAllocationStrategies.RULE_BASED)])).toEqual([
      {
        transactionType: 'CHARGEBACK',
        creditAllocationStrategy: 'RULE_BASED',
        creditAllocationOrder: [
          { order: 1, creditAllocationRule: 'PENALTY' },
          { order: 2, creditAllocationRule: 'FEE' },
          { order: 3, creditAllocationRule: 'PRINCIPAL' },
          { order: 4, creditAllocationRule: 'INTEREST' }
        ]
      }
    ]);
  });

  it('seeds the default order for a PRINCIPAL_ONLY product and treats a missing strategy as RULE_BASED', () => {
    const loanProduct = {
      creditAllocationTransactionTypes: [chargeback],
      creditAllocationAllocationTypes: allocationTypes,
      creditAllocationStrategyOptions: strategyOptions,
      creditAllocation: [
        {
          transactionType: 'CHARGEBACK',
          creditAllocationStrategy: 'PRINCIPAL_ONLY',
          creditAllocationOrder: [] as any[]
        }
      ]
    };
    const [principalOnly] = strategy.buildAdvancedCreditAllocationList(loanProduct);
    expect(principalOnly.creditAllocationStrategy).toBe('PRINCIPAL_ONLY');
    expect(principalOnly.creditAllocationOrder).toEqual(allocationTypes);

    loanProduct.creditAllocation = [
      { transactionType: 'CHARGEBACK', creditAllocationStrategy: undefined, creditAllocationOrder: [] as any[] }
    ];
    expect(strategy.buildAdvancedCreditAllocationList(loanProduct)[0].creditAllocationStrategy).toBe('RULE_BASED');
  });
});
