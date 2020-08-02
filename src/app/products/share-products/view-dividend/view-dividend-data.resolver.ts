/** Angular Imports */
import { Injectable } from '@angular/core';
import { Resolve, ActivatedRouteSnapshot } from '@angular/router';

/** rxjs Imports */
import { Observable } from 'rxjs';

/** Custom Services */
import { ProductsService } from '../../products.service';

/**
 * Share products data resolver.
 */
@Injectable()
export class ViewDividendDataResolver implements Resolve<Object> {

  /**
   * @param {ProductsService} productsService Products service.
   */
  constructor(private productsService: ProductsService) {}

  /**
   * Returns the share products data.
   * @returns {Observable<any>}
   */
  resolve(route: ActivatedRouteSnapshot): Observable<any> {
    const dividendId = route.paramMap.get('dividendId');
    const shareProductId = route.parent.parent.paramMap.get('id');
    return this.productsService.getDividendData(shareProductId, dividendId);
  }

}
