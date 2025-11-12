/** Angular Imports */
import { Injectable } from '@angular/core';

/** rxjs Imports */
import { Observable } from 'rxjs';

/** Custom Services */
import { HooksService } from '@fineract/client';

/**
 * Hooks template data resolver.
 */
@Injectable()
export class HooksTemplateResolver {
  /**
   * @param {HooksService} hooksService Hooks service.
   */
  constructor(private hooksService: HooksService) {}

  /**
   * Returns the hooks template data.
   * @returns {Observable<any>}
   */
  resolve(): Observable<any> {
    return this.hooksService.template3();
  }
}
