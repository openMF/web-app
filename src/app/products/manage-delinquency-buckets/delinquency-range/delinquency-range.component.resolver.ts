/** Angular Imports */
import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot } from '@angular/router';

/** rxjs Imports */
import { Observable } from 'rxjs';

import { DelinquencyRangeAndBucketsManagementService } from '@fineract/client';

/**
 * Delinquency Range Component data resolver.
 */
@Injectable()
export class DelinquencyRangeComponentsResolver {
  constructor(private delinquencyService: DelinquencyRangeAndBucketsManagementService) {}

  /**
   * Returns the delinquency ranges data.
   * @returns {Observable<any>}
   */
  resolve(route: ActivatedRouteSnapshot): Observable<any> {
    const delinquentcyRangeId = route.paramMap.get('rangeId');
    if (delinquentcyRangeId === null) {
      return this.delinquencyService.getDelinquencyRanges();
    } else {
      return this.delinquencyService.getDelinquencyRange({ delinquencyRangeId: +delinquentcyRangeId });
    }
  }
}
