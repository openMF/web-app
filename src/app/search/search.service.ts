/** Angular Imports */
import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';

/** rxjs Imports */
import { Observable } from 'rxjs';

/**
 * Search service.
 */
@Injectable({
  providedIn: 'root'
})
export class SearchService {
  private http = inject(HttpClient);

  /**
   * @param {string} query Query String
   * @param {string} resource Entity resource
   * @returns {Observable<any>} Search Results.
   */
  getSearchResults(query: string, resource: string): Observable<any> {
    const httpParams = new HttpParams().set('exactMatch', 'false').set('query', query).set('resource', resource);
    return this.http.get('/search', { params: httpParams });
  }
}
