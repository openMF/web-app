/** Angular Imports */
import { Injectable, inject } from '@angular/core';
import { ActivatedRouteSnapshot } from '@angular/router';

/** rxjs Imports */
import { Observable } from 'rxjs';

/** Custom Services */
import { TemplatesService } from '../templates.service';

/**
 * Template data resolver.
 */
@Injectable()
export class TemplateResolver {
  private templatesService = inject(TemplatesService);

  /**
   * Returns the Template data.
   * @returns {Observable<any>}
   */
  resolve(route: ActivatedRouteSnapshot): Observable<any> {
    const templateId = route.paramMap.get('id');
    return this.templatesService.getTemplate(templateId);
  }
}
