/** Angular Imports */
import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot } from '@angular/router';

/** rxjs Imports */
import { Observable, forkJoin } from 'rxjs';
import { map } from 'rxjs/operators';

import { TaxGroupService } from '@fineract/client';

/**
 * tax Group data resolver.
 */
@Injectable()
export class EditTaxGroupResolver {
  constructor(private taxGroupService: TaxGroupService) {}

  /**
   * Returns the tax Group data.
   * @returns {Observable<any>}
   */
  resolve(route: ActivatedRouteSnapshot): Observable<any> {
    const taxGroupId = route.parent.paramMap.get('id');
    return forkJoin([
      this.taxGroupService.retrieveTaxGroup({ taxGroupId: +taxGroupId }),
      this.taxGroupService.retrieveTemplate22()
    ]).pipe(
      map(
        ([
          taxGroup,
          template
        ]) => {
          return { ...taxGroup, taxComponents: (template as any).taxComponents };
        }
      )
    );
  }
}
