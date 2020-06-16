/** Angular Imports */
import { Injectable } from '@angular/core';
import { Resolve, ActivatedRouteSnapshot } from '@angular/router';

/** rxjs Imports */
import { Observable } from 'rxjs';

/** Custom Services */
import { SharesService } from '../shares.service';

/**
 * Shares Account data and template resolver.
 */
@Injectable()
export class SharesAccountAndTemplateResolver implements Resolve<Object> {

  /**
   * @param {SharesService} SharesService Shares service.
   */
  constructor(private sharesService: SharesService) { }

  /**
   * Returns the Shares Account data and template.
   * @param {ActivatedRouteSnapshot} route Route Snapshot
   * @returns {Observable<any>}
   */
  resolve(route: ActivatedRouteSnapshot): Observable<any> {
    const shareAccountId = route.paramMap.get('shareAccountId');
    return this.sharesService.getSharesAccountData(shareAccountId, true);
  }

}
