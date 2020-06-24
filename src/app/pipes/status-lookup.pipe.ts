import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'statusLookup'
})
export class StatusLookupPipe implements PipeTransform {

  transform(status: string): string {
    const cssClassNameLookup = {
      'true': 'status-active',
      'false': 'status-deleted',
      'Active': 'status-active',
      'charges.StatusType.active.true': 'status-active',
      'loanStatusType.submitted.and.pending.approval': 'status-pending',
      'loanStatusType.approved': 'status-approved',
      'loanStatusType.active': 'status-active',
      'loanStatusType.overpaid': 'status-overpaid',
      'savingsAccountStatusType.submitted.and.pending.approval': 'status-pending',
      'savingsAccountStatusType.approved': 'status-approved',
      'savingsAccountStatusType.active': 'status-active',
      'savingsAccountStatusType.activeInactive': 'status-active-overdue',
      'savingsAccountStatusType.activeDormant': 'status-active-overdue',
      'savingsAccountStatusType.matured': 'status-matured',
      'shareAccountStatusType.submitted.and.pending.approval': 'status-pending',
      'shareAccountStatusType.approved': 'status-approved',
      'shareAccountStatusType.active': 'status-active',
      'shareAccountStatusType.rejected': 'status-rejected',
      'loanProduct.active': 'status-active',
      'loanProduct.inActive': 'status-inactive',
      'clientStatusType.pending': 'status-pending',
      'clientStatusType.closed': 'status-closed',
      'clientStatusType.rejected': 'status-rejected', // write
      'clientStatusType.withdraw': 'status-withdraw', // write
      'clientStatusType.active': 'status-active',
      'clientStatusType.submitted.and.pending.approval': 'status-pending',
      'clientStatusTYpe.approved': 'status-approved',
      'clientStatusType.transfer.in.progress': 'status-transfer-progress', // write
      'clientStatusType.transfer.on.hold': 'status-transfer-hold', // write
      'groupingStatusType.active': 'status-active',
      'groupingStatusType.pending': 'status-pending',
      'groupingStatusType.submitted.and.pending.approval': 'status-pending',
      'groupingStatusType.approved': 'status-approved',
      'smsCampaignStatus.active': 'status-active',
      'smsCampaignStatus.pending': 'status-pending',
      'smsCampaignStatus.closed': 'status-closed',
      'purchasedSharesStatusType.applied': 'status-pending'
    };
    return cssClassNameLookup[status];
  }
}
