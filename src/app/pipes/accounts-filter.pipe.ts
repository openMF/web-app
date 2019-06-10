import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'accountsFilter'
})
export class AccountsFilterPipe implements PipeTransform {

  transform(accounts: any, type: any, status: any): any {
    if (accounts) {
      if (type === 'loan') {
        if (status === 'closed') {
          accounts = accounts.filter((account: any) => {
            return (account.status.code === 'loanStatusType.closed.written.off' ||
              account.status.code === 'loanStatusType.closed.obligations.met' ||
              account.status.code === 'loanStatusType.closed.reschedule.outstanding.amount' ||
              account.status.code === 'loanStatusType.withdrawn.by.client' ||
              account.status.code === 'loanStatusType.rejected');
          });
        } else {
          accounts = accounts.filter((account: any) => {
            return (account.status.code !== 'loanStatusType.closed.written.off' &&
              account.status.code !== 'loanStatusType.closed.obligations.met' &&
              account.status.code !== 'loanStatusType.closed.reschedule.outstanding.amount' &&
              account.status.code !== 'loanStatusType.withdrawn.by.client' &&
              account.status.code !== 'loanStatusType.rejected');
          });
        }
      }
      if (type === 'saving') {
        if (status === 'closed') {
          accounts = accounts.filter((account: any) => {
            return (account.status.code === 'savingsAccountStatusType.withdrawn.by.applicant' ||
              account.status.code === 'savingsAccountStatusType.closed' ||
              account.status.code === 'savingsAccountStatusType.pre.mature.closure' ||
              account.status.code === 'savingsAccountStatusType.rejected');
          });
        } else {
          accounts = accounts.filter((account: any) => {
            return (account.status.code !== 'savingsAccountStatusType.withdrawn.by.applicant' &&
              account.status.code !== 'savingsAccountStatusType.closed' &&
              account.status.code !== 'savingsAccountStatusType.pre.mature.closure' &&
              account.status.code !== 'savingsAccountStatusType.rejected');
          });
        }
      }
      if (type === 'share') {
        if (status === 'closed') {
          accounts = accounts.filter((account: any) => {
            return (account.status.code === 'shareAccountStatusType.closed' ||
              account.status.code === 'shareAccountStatusType.rejected');
          });
        } else {
          accounts = accounts.filter((account: any) => {
            return (account.status.code !== 'shareAccountStatusType.closed' &&
              account.status.code !== 'shareAccountStatusType.rejected');
          });
        }
      }
      return accounts;
    }
  }
}
