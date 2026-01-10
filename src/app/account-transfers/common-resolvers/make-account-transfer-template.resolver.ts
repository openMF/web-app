/** Angular Imports */
import { Injectable, inject } from '@angular/core';
import { ActivatedRouteSnapshot } from '@angular/router';

/** rxjs Imports */
import { Observable } from 'rxjs';

/** Custom Services */
import { AccountTransfersService } from '../account-transfers.service';

/**
 * View Standing Instructions resolver.
 */
@Injectable()
export class MakeAccountTransferTemplateResolver {
  private accountTransfersService = inject(AccountTransfersService);

  accountTypeId: string;
  id: any;

  /**
   * Returns the Standing Instructions Data.
   * @param {ActivatedRouteSnapshot} route Route Snapshot
   * @returns {Observable<any>}
   */
  resolve(route: ActivatedRouteSnapshot): Observable<any> {
    const accountType = route.queryParamMap.get('accountType');
    switch (accountType) {
      case 'fromloans':
        this.accountTypeId = '1';
        this.id = route.queryParamMap.get('loanId');
        break;
      case 'fromsavings':
        this.accountTypeId = '2';
        this.id = route.queryParamMap.get('savingsId');
        break;
      case 'interbank':
        this.accountTypeId = '2';
        this.id = route.queryParamMap.get('savingsId');
        break;
      default:
        this.accountTypeId = '0';
    }
    return this.accountTransfersService.newAccountTranferResource(this.id, this.accountTypeId);
  }
}
