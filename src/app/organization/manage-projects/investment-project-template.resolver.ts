/** Angular Imports */
import { Injectable } from '@angular/core';
import { Resolve, ActivatedRouteSnapshot } from '@angular/router';
import { AccountTransfersService } from 'app/account-transfers/account-transfers.service';

/** rxjs Imports */
import { Observable } from 'rxjs';

/** Custom Services */

/**
 * View Standing Instructions resolver.
 */
@Injectable()
export class InvestmentProjectTemplateResolver implements Resolve<Object> {
  /**
   * @param {accountTransfersService} AccountTransfersService Account Transfers service.
   */
  constructor(private accountTransfersService: AccountTransfersService) {}

  resolve(route: ActivatedRouteSnapshot): Observable<any> {
    const accountId = 1;
    const accountType = '0';

    return this.accountTransfersService.newAccountTranferResource(accountId, accountType);
  }
}
