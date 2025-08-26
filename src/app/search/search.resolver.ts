/** Angular Imports */
import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot } from '@angular/router';

/** rxjs Imports */
import { Observable } from 'rxjs';

/** Custom Services */
import { SearchAPIService } from '@fineract/client';

/**
 * Search Results data resolver.
 */
@Injectable()
export class SearchResolver {
  /**
   * @param {SearchAPIService} searchAPIService Notifications service.
   */
  constructor(private searchAPIService: SearchAPIService) {}

  /**
   * Returns the Search Resultsdata.
   * @param {ActivatedRouteSnapshot} route Route Snapshot
   * @returns {Observable<any>}
   */
  resolve(route: ActivatedRouteSnapshot): Observable<any> {
    const query = route.queryParams['query'];
    const resource = route.queryParams['resource'];
    return this.searchAPIService.searchData({
      query,
      resource
    });
  }
}
