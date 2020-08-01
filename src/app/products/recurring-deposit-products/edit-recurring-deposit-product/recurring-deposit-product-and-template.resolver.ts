/** Angular Imports */
import { Injectable } from '@angular/core';
import { Resolve, ActivatedRouteSnapshot } from '@angular/router';

/** rxjs Imports */
import { Observable } from 'rxjs';

/** Custom Services */
import { ProductsService } from '../../products.service';

/**
 * Recurring Deposits Account Template resolver.
 */
@Injectable()
export class RecurringDepositProductAndTemplateResolver implements Resolve<Object> {

    /**
     * @param {ProductsService} productsService Products service.
     */
    constructor(private productsService: ProductsService) { }

    /**
     * Returns the Recurring Deposits Product and Template.
     * @param {ActivatedRouteSnapshot} route Route Snapshot
     * @returns {Observable<any>}
     */
    resolve(route: ActivatedRouteSnapshot): Observable<any> {
        const recurringDepositProductId = route.paramMap.get('id');
        return this.productsService.getRecurringDepositProductAndTemplate(recurringDepositProductId);
    }

}
