import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'loanProvisioningAccountFiltering'
})
export class LoanProvisioningAccountFilteringPipe implements PipeTransform {

  transform(accounts: any, account_type: any): any {
    if (accounts) {
      return accounts.filter((account: any) => account.type.code === account_type);
    }
    return null;
  }

}
