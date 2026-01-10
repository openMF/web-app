/** Angular Imports */
import { Injectable, inject } from '@angular/core';

/** rxjs Imports */
import { Observable } from 'rxjs';

/** Custom Services */
import { TemplatesService } from '../templates.service';

/**
 * Templates data resolver.
 */
@Injectable()
export class TemplatesResolver {
  private templatesService = inject(TemplatesService);

  /**
   * Returns the templates data.
   * @returns {Observable<any>}
   */
  resolve(): Observable<any> {
    return this.templatesService.getTemplates();
  }
}
