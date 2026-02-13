/** Angular Imports */
import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot } from '@angular/router';

/** rxjs Imports */
import { Observable } from 'rxjs';

/** Custom Services */
import { ShareAccountService } from '@fineract/client';

/**
 * Shares Account Actions data resolver.
 */
@Injectable()
export class ShareAccountActionsResolver {
  /**
   * @param {ShareAccountService} ShareAccountService Shares account service.
   */
  constructor(private shareAccountService: ShareAccountService) {}

  /**
   * Returns the Shares account actions data.
   * @param {ActivatedRouteSnapshot} route Route Snapshot
   * @returns {Observable<any>}
   */
  resolve(route: ActivatedRouteSnapshot): Observable<any> {
    const actionName = route.paramMap.get('name');
    const shareAccountId = route.paramMap.get('shareAccountId') || route.parent.parent.paramMap.get('shareAccountId');
    switch (actionName) {
      case 'Apply Additional Shares':
      case 'Redeem Shares':
      case 'Approve Additional Shares':
      case 'Reject Additional Shares':
        return this.shareAccountService.retrieveAccount({
          accountId: Number(shareAccountId),
          type: 'full'
        });
      default:
        return undefined;
    }
  }
}
