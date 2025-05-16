/** Angular Imports */
import { Injectable } from '@angular/core';

/** rxjs Imports */
import { Observable } from 'rxjs';

/** Custom Services */
import { TemplatesService } from '../templates.service';

/**
 * Templates data resolver.
 */
@Injectable()
export class TemplatesResolver {
  /**
   * @param {TemplatesService} templatesService Templates service.
   */
  constructor(private templatesService: TemplatesService) {}

  /**
   * Returns the templates data.
   * @returns {Observable<any>}
   */
  resolve(): Observable<any> {
    return this.templatesService.getTemplates();
  }
}
