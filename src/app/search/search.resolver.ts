/** Angular Imports */
import { Injectable, inject } from '@angular/core';
import { ActivatedRouteSnapshot } from '@angular/router';

/** rxjs Imports */
import { Observable } from 'rxjs';

/** Custom Services */
import { SearchService } from './search.service';

/**
 * Search Results data resolver.
 */
@Injectable()
export class SearchResolver {
  private searchService = inject(SearchService);

  /**
   * Returns the Search Resultsdata.
   * @param {ActivatedRouteSnapshot} route Route Snapshot
   * @returns {Observable<any>}
   */
  resolve(route: ActivatedRouteSnapshot): Observable<any> {
    const query = route.queryParams['query'];
    const resource = route.queryParams['resource'];
    return this.searchService.getSearchResults(query, resource);
  }
}
