/** Angular Imports */
import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot } from '@angular/router';

/** rxjs Imports */
import { Observable } from 'rxjs';

/** Custom Services */
import { ShareAccountService } from '@fineract/client';

/**
 * Shares Account data and template resolver.
 */
@Injectable()
export class SharesAccountAndTemplateResolver {
  /**
   * @param {ShareAccountService} ShareAccountService Share account service.
   */
  constructor(private shareAccountService: ShareAccountService) {}

  /**
   * Returns the Shares Account data and template.
   * @param {ActivatedRouteSnapshot} route Route Snapshot
   * @returns {Observable<any>}
   */
  resolve(route: ActivatedRouteSnapshot): Observable<any> {
    const shareAccountId = route.paramMap.get('shareAccountId');
    return this.shareAccountService.retrieveAccount({
      accountId: Number(shareAccountId),
      type: 'true'
    });
  }
}
