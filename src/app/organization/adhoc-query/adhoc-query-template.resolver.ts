/** Angular Imports */
import { Injectable } from '@angular/core';

/** rxjs Imports */
import { Observable } from 'rxjs';

/** Custom Services */
import { AdhocQueryApiService } from '@fineract/client';
/**
 * Adhoc Query template data resolver.
 */
@Injectable()
export class AdhocQueryTemplateResolver {
  /**
   * @param {AdhocQueryApiService} adhocQueryApiService Adhoc Query API service.
   */
  constructor(private adhocQueryApiService: AdhocQueryApiService) {}

  /**
   * Returns the adhoc query template data.
   * @returns {Observable<any>}
   */
  resolve(): Observable<any> {
    return this.adhocQueryApiService.template();
  }
}
