/** Angular Imports */
import { Injectable } from '@angular/core';
import { Resolve, ActivatedRouteSnapshot } from '@angular/router';

/** rxjs Imports */
import { Observable } from 'rxjs';

/** Custom Services */
import { SharesService } from '../shares.service';

/**
 * Share Account data resolver.
 */
@Injectable()
export class ViewshareaccountResolver implements Resolve<Object> {

  /**
   * @param {SharesService} sharesService Shares service.
   */
  constructor(private sharesService: SharesService) {}

  /**
   * Returns the Share Account data.
   * @returns {Observable<any>}
   */
  resolve(route: ActivatedRouteSnapshot): Observable<any> {
    const shareAccountId = route.paramMap.get('shareAccountId');
    console.log(shareAccountId);
    return this.sharesService.getShareAccount(shareAccountId);
  }

}
