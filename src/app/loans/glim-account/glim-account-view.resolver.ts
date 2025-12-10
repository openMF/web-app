/** Angular Imports */
import { Injectable, inject } from '@angular/core';
import { ActivatedRouteSnapshot } from '@angular/router';

/** rxjs Imports */
import { Observable } from 'rxjs';

/** Custom Services */
import { LoansService } from '../loans.service';

/**
 * GLIM Account data resolver.
 */
@Injectable()
export class GLIMViewResolver {
  private loansService = inject(LoansService);

  /**
   * Returns the Savings Account data.
   * @param {ActivatedRouteSnapshot} route Route Snapshot
   * @returns {Observable<any>}
   */
  resolve(route: ActivatedRouteSnapshot): Observable<any> {
    const groupId = route.paramMap.get('groupId');
    const glimId = route.paramMap.get('glimId');
    return this.loansService.getGLIMAccountData(glimId, groupId);
  }
}
