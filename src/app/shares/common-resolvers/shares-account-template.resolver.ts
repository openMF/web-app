/** Angular Imports */
import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot } from '@angular/router';

/** rxjs Imports */
import { Observable } from 'rxjs';

/** Custom Services */
import { ShareAccountService } from '@fineract/client';

/**
 * Shares Account Template resolver.
 */
@Injectable()
export class SharesAccountTemplateResolver {
  /**
   * @param {ShareAccountService} ShareAccountService Shares account service.
   */
  constructor(private shareAccountService: ShareAccountService) {}

  /**
   * Returns the Shares Account Template.
   * @param {ActivatedRouteSnapshot} route Route Snapshot
   * @returns {Observable<any>}
   */
  resolve(route: ActivatedRouteSnapshot): Observable<any> {
    const clientId = route.parent.parent.paramMap.get('clientId');
    return this.shareAccountService.template7({ type: 'client', clientId: clientId ? +clientId : undefined });
  }
}
