/** Angular Imports */
import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot } from '@angular/router';

/** rxjs Imports */
import { Observable } from 'rxjs';

/** Custom Services */
import { AdhocQueryApiService } from '@fineract/client';

/**
 * Adhoc Query and template data resolver.
 */
@Injectable()
export class AdhocQueryAndTemplateResolver {
  /**
   * @param {AdhocQueryApiService} adhocQueryApiService Adhoc Query API service.
   */
  constructor(private adhocQueryApiService: AdhocQueryApiService) {}

  /**
   * Returns the adhoc query and template data.
   * @returns {Observable<any>}
   */
  resolve(route: ActivatedRouteSnapshot): Observable<any> {
    const adhocQueryId = route.paramMap.get('id');
    return this.adhocQueryApiService.retrieveAll2();
  }
}
