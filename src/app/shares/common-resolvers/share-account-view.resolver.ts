/** Angular Imports */
import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot } from '@angular/router';

/** rxjs Imports */
import { Observable } from 'rxjs';

/** Custom Services */
import { ShareAccountService } from '@fineract/client';

/**
 * Shares Account data resolver.
 */
@Injectable()
export class SharesAccountViewResolver {
  /**
   * @param {ShareAccountService} ShareAccountService Shares account service.
   */
  constructor(private shareAccountService: ShareAccountService) {}

  /**
   * Returns the Shares Account data.
   * @param {ActivatedRouteSnapshot} route Route Snapshot
   * @returns {Observable<any>}
   */
  resolve(route: ActivatedRouteSnapshot): Observable<any> {
    const shareAccountId = route.paramMap.get('shareAccountId') || route.parent.paramMap.get('shareAccountId');
    return this.shareAccountService.retrieveAccount({
      accountId: Number(shareAccountId),
      type: 'default'
    });
  }
}
