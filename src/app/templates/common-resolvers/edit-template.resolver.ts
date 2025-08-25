/** Angular Imports */
import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot } from '@angular/router';

/** rxjs Imports */
import { Observable } from 'rxjs';

/** Custom Services */
import { UserGeneratedDocumentsService } from '@fineract/client';

/**
 * Edit Template data resolver.
 */
@Injectable()
export class EditTemplateResolver {
  /**
   * @param {UserGeneratedDocumentsService} userGeneratedDocumentsService User Generated Documents service.
   */
  constructor(private userGeneratedDocumentsService: UserGeneratedDocumentsService) {}

  /**
   * Returns the template data.
   * @returns {Observable<any>}
   */
  resolve(route: ActivatedRouteSnapshot): Observable<any> {
    const templateId = route.paramMap.get('id');
    return this.userGeneratedDocumentsService.getTemplateByTemplate({
      templateId: Number(templateId)
    });
  }
}
