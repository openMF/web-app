/** Angular Imports */
import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot } from '@angular/router';

/** rxjs Imports */
import { Observable } from 'rxjs';

import { DelinquencyRangeAndBucketsManagementService } from '@fineract/client';

/**
 * Delinquency Bucket Component data resolver.
 */
@Injectable()
export class DelinquencyBucketComponentsResolver {
  constructor(private delinquencyService: DelinquencyRangeAndBucketsManagementService) {}

  /**
   * Returns the delinquency buckets data.
   * @returns {Observable<any>}
   */
  resolve(route: ActivatedRouteSnapshot): Observable<any> {
    const delinquentcyBucketId = route.paramMap.get('bucketId');
    if (delinquentcyBucketId === null) {
      return this.delinquencyService.getDelinquencyBuckets();
    } else {
      return this.delinquencyService.getDelinquencyBucket({ delinquencyBucketId: +delinquentcyBucketId });
    }
  }
}
