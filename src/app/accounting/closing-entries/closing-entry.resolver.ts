/** Angular Imports */
import { Injectable, inject } from '@angular/core';
import { ActivatedRouteSnapshot } from '@angular/router';

/** rxjs Imports */
import { Observable } from 'rxjs';

/** Custom Services */
import { AccountingService } from '../accounting.service';

/**
 * Closing entry data resolver.
 */
@Injectable()
export class ClosingEntryResolver {
  private accountingService = inject(AccountingService);

  /**
   * Returns the gl account closure data.
   * @returns {Observable<any>}
   */
  resolve(route: ActivatedRouteSnapshot): Observable<any> {
    const glAccountClosureId = route.paramMap.get('id');
    return this.accountingService.getAccountingClosure(glAccountClosureId);
  }
}
