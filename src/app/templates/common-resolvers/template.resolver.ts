/** Angular Imports */
import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot } from '@angular/router';

/** rxjs Imports */
import { Observable } from 'rxjs';

/** Custom Services */
import { UserGeneratedDocumentsService } from '@fineract/client';

/**
 * Template data resolver.
 */
@Injectable()
export class TemplateResolver {
  /**
   * @param {UserGeneratedDocumentsService} userGeneratedDocumentsService User Generated Documents service.
   */
  constructor(private userGeneratedDocumentsService: UserGeneratedDocumentsService) {}

  /**
   * Returns the Template data.
   * @returns {Observable<any>}
   */
  resolve(route: ActivatedRouteSnapshot): Observable<any> {
    const templateId = Number(route.paramMap.get('id'));
    return this.userGeneratedDocumentsService.retrieveOne30({ templateId });
  }
}
