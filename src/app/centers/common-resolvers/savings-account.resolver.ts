/** Angular Imports */
import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot } from '@angular/router';

/** rxjs Imports */
import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';

/** Custom Services */
import { CentersService } from '@fineract/client';

/**
 * Savings account resolver.
 */
@Injectable()
export class SavingsAccountResolver {
  /**
   * @param {CentersService} centersService Centers service.
   */
  constructor(private centersService: CentersService) {}

  /**
   * Returns the savings account data.
   * @returns {Observable<any>}
   */
  resolve(route: ActivatedRouteSnapshot): Observable<any> {
    const centerId = route.parent.parent.paramMap.get('centerId');
    return this.centersService
      .retrieveGroupAccount({ centerId: parseInt(centerId, 10) })
      .pipe(catchError(() => of({ savingsAccounts: [] })));
  }
}
