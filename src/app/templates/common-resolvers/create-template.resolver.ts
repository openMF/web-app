/** Angular Imports */
import { Injectable, inject } from '@angular/core';

/** rxjs Imports */
import { Observable } from 'rxjs';

/** Custom Services */
import { TemplatesService } from '../templates.service';

/**
 * Create Template data resolver.
 */
@Injectable()
export class CreateTemplateResolver {
  private templatesService = inject(TemplatesService);

  /** Inserted by Angular inject() migration for backwards compatibility */
  constructor(...args: unknown[]);

  /**
   * @param {TemplatesService} templatesService Templates service.
   */
  constructor() {}

  /**
   * Returns the template data.
   * @returns {Observable<any>}
   */
  resolve(): Observable<any> {
    return this.templatesService.getCreateTemplateData();
  }
}
