/** Angular Imports */
import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot } from '@angular/router';

/** rxjs Imports */
import { Observable } from 'rxjs';

import { TaxComponentsService } from '@fineract/client';

/**
 * tax Component data resolver.
 */
@Injectable()
export class TaxComponentResolver {
  constructor(private taxComponentsService: TaxComponentsService) {}

  /**
   * Returns the tax Component data.
   * @returns {Observable<any>}
   */
  resolve(route: ActivatedRouteSnapshot): Observable<any> {
    const taxComponentId = route.paramMap.get('id');
    return this.taxComponentsService.retrieveTaxComponent({ taxComponentId: +taxComponentId });
  }
}
