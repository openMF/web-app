/** Angular Imports */
import { Injectable } from '@angular/core';
import { Resolve, ActivatedRoute, ActivatedRouteSnapshot } from '@angular/router';

/** rxjs Imports */
import { Observable } from 'rxjs';

/** Custom Services */
import { ProductsService } from '../products.service';

@Injectable()
export class ChargesTemplateAndResolver implements Resolve<Object> {

    constructor(private productsService: ProductsService) { }

    /**
     * Returns the changes template and data.
     * @returns {Observable<any>}
     */
    resolve(route: ActivatedRouteSnapshot): Observable<any> {
        const savingProductId = route.paramMap.get('id');
        return this.productsService.getCharge(savingProductId, true);
    }

}
