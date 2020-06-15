/** Angular Imports */
import { Injectable } from '@angular/core';
import { Resolve, ActivatedRouteSnapshot } from '@angular/router';

/** rxjs Imports */
import { Observable } from 'rxjs';

/** Custom Services */
import { SharesService } from '../shares.service';

/**
 * Shares Account Template resolver.
 */
@Injectable()
export class SharesAccountTemplateResolver implements Resolve<Object> {

  /**
   * @param {SharesService} SharesService Shares service.
   */
  constructor(private sharesService: SharesService) { }

  /**
   * Returns the Shares Account Template.
   * @param {ActivatedRouteSnapshot} route Route Snapshot
   * @returns {Observable<any>}
   */
  resolve(route: ActivatedRouteSnapshot): Observable<any> {
    const clientId = route.parent.parent.paramMap.get('clientId');
    return this.sharesService.getSharesAccountTemplate(clientId);
  }

}
