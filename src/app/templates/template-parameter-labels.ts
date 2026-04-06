/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

export const clientParameterLabels = [
  '{{client.accountNo}}',
  '{{client.status.value}}',
  '{{client.fullname}}',
  '{{client.displayName}}',
  '{{client.officeName}}',
  '{{#client.groups}}',
  '{{/client.groups}}'
];

export const loanParameterLabels = [
  '{{loan.accountNo}}',
  '{{loan.status.value}}',
  '{{loan.loanProductId}}',
  '{{loan.loanProductName}}',
  '{{loan.loanProductDescription}}'
];

export const repaymentParameterLabels = [
  '{{loan.repaymentSchedule.loanTermInDays}}',
  '{{loan.repaymentSchedule.totalPrincipalDisbursed}}',
  '{{loan.repaymentSchedule.totalPrincipalExpected}}',
  '{{loan.repaymentSchedule.totalPrincipalPaid}}',
  '{{loan.repaymentSchedule.totalInterestCharged}}',
  '{{loan.repaymentSchedule.totalFeeChargesCharged}}',
  '{{loan.repaymentSchedule.totalPenaltyChargesCharged}}',
  '{{loan.repaymentSchedule.totalWaived}}',
  '{{loan.repaymentSchedule.totalWrittenOff}}',
  '{{loan.repaymentSchedule.totalRepaymentExpected}}',
  '{{loan.repaymentSchedule.totalRepayment}}',
  '{{loan.repaymentSchedule.totalPaidInAdvance}}',
  '{{loan.repaymentSchedule.totalPaidLate}}',
  '{{loan.repaymentSchedule.totalOutstanding}}'
];
