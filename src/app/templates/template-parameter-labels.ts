export const clientParameterLabels =  [
  '{{client.accountNo}}',
  '{{client.status.value}}',
  '{{client.fullname}}',
  '{{client.displayName}}',
  '{{client.officeName}}',
  '{{#client.groups}}',
  '{{/client.groups}}'
];

export const loanParameterLabels =  [
  '{{loan.accountNo}}',
  '{{loan.status.value}}',
  '{{loan.loanProductId}}',
  '{{loan.loanProductName}}',
  '{{loan.loanProductDescription}}'
];

export const repaymentParameterLabels =  [
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
