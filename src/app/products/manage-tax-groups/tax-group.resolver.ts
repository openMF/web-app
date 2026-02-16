/** Angular Imports */
import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot } from '@angular/router';

/** rxjs Imports */
import { Observable } from 'rxjs';

import { TaxGroupService } from '@fineract/client';

/**
 * tax Group data resolver.
 */
@Injectable()
export class TaxGroupResolver {
  constructor(private taxGroupService: TaxGroupService) {}

  /**
   * Returns the tax Group data.
   * @returns {Observable<any>}
   */
  resolve(route: ActivatedRouteSnapshot): Observable<any> {
    const taxGroupId = route.paramMap.get('id');
    return this.taxGroupService.retrieveTaxGroup({ taxGroupId: +taxGroupId });
  }
}
