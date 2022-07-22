/** Angular Imports */
import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve, RouterStateSnapshot } from '@angular/router';

/** rxjs Imports */
import { Observable } from 'rxjs';

/** Custom Services */
import { ProductsService } from '../products.service';

/**
 * Collaterals data resolver
 */
@Injectable()
export class CollateralsResolver implements Resolve<Object> {
    /**
     * @param {ProductsService} productsService Products service
     */
    constructor(private productsService: ProductsService) {}

    /**
     * Returns the All Collaterals Data
     * @returns {Observable<any>}
     */
    resolve(): Observable<any> {
        return this.productsService.getCollaterals();
    }
}
