/** Angular Imports */
import { Injectable } from '@angular/core';

/** rxjs Imports */
import { Observable } from 'rxjs';

/** Custom Services */
import { SearchAPIService } from '@fineract/client';

/**
 * Advance Search Template resolver.
 */
@Injectable()
export class AdvanceSearchTemplateResolver {
  /**
   * @param {SearchAPIService} searchAPIService Search API service.
   */
  constructor(private searchAPIService: SearchAPIService) {}

  /**
   * Returns the Advance Search template.
   * @returns {Observable<any>}
   */
  resolve(): Observable<any> {
    return this.searchAPIService.retrieveAdHocSearchQueryTemplate();
  }
}
