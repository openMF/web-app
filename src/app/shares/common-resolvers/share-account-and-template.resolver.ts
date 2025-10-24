/** Angular Imports */
import { Injectable, inject } from '@angular/core';
import { ActivatedRouteSnapshot } from '@angular/router';

/** rxjs Imports */
import { Observable } from 'rxjs';

/** Custom Services */
import { SharesService } from '../shares.service';

/**
 * Shares Account data and template resolver.
 */
@Injectable()
export class SharesAccountAndTemplateResolver {
  private sharesService = inject(SharesService);

  /** Inserted by Angular inject() migration for backwards compatibility */
  constructor(...args: unknown[]);

  /**
   * @param {SharesService} SharesService Shares service.
   */
  constructor() {}

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
