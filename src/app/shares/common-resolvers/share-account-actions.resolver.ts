/** Angular Imports */
import { Injectable } from '@angular/core';
import { Resolve, ActivatedRouteSnapshot } from '@angular/router';

/** rxjs Imports */
import { Observable } from 'rxjs';

/** Custom Services */
import { SharesService } from '../shares.service';

/**
 * Shares Account Actions data resolver.
 */
@Injectable()
export class ShareAccountActionsResolver implements Resolve<Object> {

  /**
   * @param {sharesService} SharesService Shares service.
   */
  constructor(private sharesService: SharesService) { }

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
        return this.sharesService.getSharesAccountData(shareAccountId, true);
      default:
        return undefined;
    }
  }

}
