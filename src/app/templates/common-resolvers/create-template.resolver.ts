/** Angular Imports */
import { Injectable } from '@angular/core';

/** rxjs Imports */
import { Observable } from 'rxjs';

/** Custom Services */
import { UserGeneratedDocumentsService } from '@fineract/client';

/**
 * Create Template data resolver.
 */
@Injectable()
export class CreateTemplateResolver {
  /**
   * @param {UserGeneratedDocumentsService} userGeneratedDocumentsService User Generated Documents service.
   */
  constructor(private userGeneratedDocumentsService: UserGeneratedDocumentsService) {}

  /**
   * Returns the template data.
   * @returns {Observable<any>}
   */
  resolve(): Observable<any> {
    return this.userGeneratedDocumentsService.template20();
  }
}
