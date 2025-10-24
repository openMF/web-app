/** Angular Imports */
import { Injectable, inject } from '@angular/core';

/** rxjs Imports */
import { Observable } from 'rxjs';

/** Custom Services */
import { OrganizationService } from '../organization.service';

/**
 * Currencies data resolver.
 */
@Injectable()
export class CurrenciesResolver {
  private organizationService = inject(OrganizationService);

  /** Inserted by Angular inject() migration for backwards compatibility */
  constructor(...args: unknown[]);

  /**
   * @param {OrganizationService} organizationService Organization service.
   */
  constructor() {}

  /**
   * Returns the currencies data.
   * @returns {Observable<any>}
   */
  resolve(): Observable<any> {
    return this.organizationService.getCurrencies();
  }
}
