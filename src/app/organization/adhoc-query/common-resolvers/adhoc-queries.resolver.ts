/** Angular Imports */
import { Injectable } from '@angular/core';

/** rxjs Imports */
import { Observable } from 'rxjs';

/** Custom Services */
import { AdhocQueryApiService } from '@fineract/client';

/**
 * Adhoc Queries data resolver.
 */
@Injectable()
export class AdhocQueriesResolver {
  /**
   * @param {AdhocQueryApiService} adhocQueryApiService Adhoc Query API service.
   */
  constructor(private adhocQueryApiService: AdhocQueryApiService) {}

  /**
   * Returns the adhoc queries data.
   * @returns {Observable<any>}
   */
  resolve(): Observable<any> {
    return this.adhocQueryApiService.retrieveAll2();
  }
}
