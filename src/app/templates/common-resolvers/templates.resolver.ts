/** Angular Imports */
import { Injectable } from '@angular/core';

/** rxjs Imports */
import { Observable } from 'rxjs';

/** Custom Services */
import { UserGeneratedDocumentsService } from '@fineract/client';

/**
 * Templates data resolver.
 */
@Injectable()
export class TemplatesResolver {
  /**
   * @param {UserGeneratedDocumentsService} userGeneratedDocumentsService User Generated Documents service.
   */
  constructor(private userGeneratedDocumentsService: UserGeneratedDocumentsService) {}

  /**
   * Returns the templates data.
   * @returns {Observable<any>}
   */
  resolve(): Observable<any> {
    return this.userGeneratedDocumentsService.retrieveAll40();
  }
}
