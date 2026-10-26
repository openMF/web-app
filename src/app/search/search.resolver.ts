/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

/** Angular Imports */
import { Injectable, inject } from '@angular/core';
import { ActivatedRouteSnapshot } from '@angular/router';

/** rxjs Imports */
import { Observable, forkJoin, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

/** Custom Services */
import { SearchService } from './search.service';
import { SearchResultsBundle } from './search.model';

/** Every resource supported by the /search endpoint. Scope narrowing happens client-side. */
const ALL_SEARCH_RESOURCES =
  'clients,clientIdentifiers,groups,savings,shares,loans,loanTransactions,savingsTransactions';

/**
 * Search Results data resolver.
 */
@Injectable()
export class SearchResolver {
  private searchService = inject(SearchService);

  /**
   * Returns the search results plus any accounting entries matching the query
   * as an exact transaction id. Each source fails independently so that, for
   * example, a user without accounting permissions still gets entity results.
   * @param {ActivatedRouteSnapshot} route Route Snapshot
   * @returns {Observable<SearchResultsBundle>}
   */
  resolve(route: ActivatedRouteSnapshot): Observable<SearchResultsBundle> {
    const query: string = route.queryParams['query'] || '';
    return forkJoin({
      entities: this.searchService.getSearchResults(query, ALL_SEARCH_RESOURCES).pipe(catchError(() => of([]))),
      journalEntries: this.resolveJournalEntries(query)
    });
  }

  private resolveJournalEntries(query: string): Observable<any[]> {
    if (!query) {
      return of([]);
    }
    return this.searchService.getJournalEntriesByTransactionId(query).pipe(
      map((response: any) => response?.pageItems || []),
      catchError(() => of([]))
    );
  }
}
