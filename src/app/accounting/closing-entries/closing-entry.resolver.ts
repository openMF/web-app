/** Angular Imports */
import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot } from '@angular/router';

/** rxjs Imports */
import { Observable } from 'rxjs';

/** Custom Services */
import { AccountingClosureService } from '@fineract/client';

/**
 * Closing entry data resolver.
 */
@Injectable()
export class ClosingEntryResolver {
  /**
   * @param {AccountingClosureService} accountingClosureService Accounting closure service.
   */
  constructor(private accountingClosureService: AccountingClosureService) {}

  /**
   * Returns the gl account closure data.
   * @returns {Observable<any>}
   */
  resolve(route: ActivatedRouteSnapshot): Observable<any> {
    const glAccountClosureId = route.paramMap.get('id');
    return this.accountingClosureService.retreiveClosure({ glClosureId: parseInt(glAccountClosureId, 10) });
  }
}
