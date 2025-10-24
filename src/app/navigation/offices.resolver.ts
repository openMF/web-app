/** Angular Imports */
import { Injectable, inject } from '@angular/core';

/** rxjs Imports */
import { Observable } from 'rxjs';

/** Custom Services */
import { NavigationService } from './navigation.service';

/**
 * Offices data resolver.
 */
@Injectable()
export class OfficesResolver {
  private navigationService = inject(NavigationService);

  /** Inserted by Angular inject() migration for backwards compatibility */
  constructor(...args: unknown[]);

  /**
   * @param {NavigationService} navigationService Navigation service.
   */
  constructor() {}

  /**
   * Returns the Offices data.
   * @returns {Observable<any>}
   */
  resolve(): Observable<any> {
    return this.navigationService.getOffices();
  }
}
