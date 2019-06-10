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
    };
    return cssClassNameLookup[status];
  }
}
