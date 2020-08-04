/** Angular Imports */
import { Injectable } from '@angular/core';
import { Resolve } from '@angular/router';

/** rxjs Imports */
import { Observable } from 'rxjs';

/** Custom Services */
import { ProductsService } from '../../products.service';

/**
 * Tax Group template data resolver.
 */
@Injectable()
export class ManageTaxGroupTemplateResolver implements Resolve<Object> {

    /**
     * @param {ProductsService} productsService Products service.
     */
    constructor(private productsService: ProductsService) { }

    /**
     * Returns the tax groups template data.
     * @returns {Observable<any>}
     */
    resolve(): Observable<any> {
        return this.productsService.getTaxGroupTemplate();
    }

}
