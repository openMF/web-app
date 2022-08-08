/** Angular Imports */
import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve } from '@angular/router';

/** rxjs Imports */
import { Observable } from 'rxjs';

/** Custom Services */
import { ProductsService } from '../../products.service';

/**
 * Delinquency Bucket Component data resolver.
 */
@Injectable()
export class DelinquencyBucketComponentsResolver implements Resolve<Object> {

  /**
   * @param {ProductsService} productsService Products service.
   */
  constructor(private productsService: ProductsService) {}

  /**
   * Returns the delinquency buckets data.
   * @returns {Observable<any>}
   */
   resolve(route: ActivatedRouteSnapshot): Observable<any> {
    const delinquentcyBucketId = route.paramMap.get('bucketId');
    if (delinquentcyBucketId === null) {
      return this.productsService.getDelinquencyBuckets();
    } else {
      return this.productsService.getDelinquencyBucket(delinquentcyBucketId);
    }
  }

}
