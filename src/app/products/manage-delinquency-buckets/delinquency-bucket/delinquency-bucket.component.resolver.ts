/** Angular Imports */
import { Injectable, inject } from '@angular/core';
import { ActivatedRouteSnapshot } from '@angular/router';

/** rxjs Imports */
import { Observable } from 'rxjs';

/** Custom Services */
import { ProductsService } from '../../products.service';

/**
 * Delinquency Bucket Component data resolver.
 */
@Injectable()
export class DelinquencyBucketComponentsResolver {
  private productsService = inject(ProductsService);

  /** Inserted by Angular inject() migration for backwards compatibility */
  constructor(...args: unknown[]);

  /**
   * @param {ProductsService} productsService Products service.
   */
  constructor() {}

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
