/** Angular Imports */
import { Injectable, inject } from '@angular/core';
import { ActivatedRouteSnapshot } from '@angular/router';

/** rxjs Imports */
import { Observable } from 'rxjs';

/** Custom Services */
import { ProductsService } from '../../products.service';

/**
 * Share products data resolver.
 */
@Injectable()
export class ViewDividendDataResolver {
  private productsService = inject(ProductsService);

  /**
   * Returns the share products data.
   * @returns {Observable<any>}
   */
  resolve(route: ActivatedRouteSnapshot): Observable<any> {
    const dividendId = route.paramMap.get('dividendId');
    const shareProductId = route.parent.parent.paramMap.get('productId');
    return this.productsService.getDividendData(shareProductId, dividendId);
  }
}
