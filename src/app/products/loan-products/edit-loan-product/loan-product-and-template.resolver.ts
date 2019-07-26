/** Angular Imports */
import { Injectable } from '@angular/core';
import { Resolve, ActivatedRouteSnapshot } from '@angular/router';

/** rxjs Imports */
import { Observable } from 'rxjs';

/** Custom Services */
import { ProductsService } from '../../products.service';

/**
 * Loan product and template data resolver.
 */
@Injectable()
export class LoanProductAndTemplateResolver implements Resolve<Object> {

  /**
   * @param {ProductsService} productsService Products service.
   */
  constructor(private productsService: ProductsService) {}

  /**
   * Returns the loan product and template data.
   * @returns {Observable<any>}
   */
  resolve(route: ActivatedRouteSnapshot): Observable<any> {
    const loanProductId = route.paramMap.get('id');
    return this.productsService.getLoanProduct(loanProductId, true);
  }

}
