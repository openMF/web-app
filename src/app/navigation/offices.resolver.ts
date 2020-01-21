/** Angular Imports */
import { Injectable } from '@angular/core';
import { Resolve } from '@angular/router';

/** rxjs Imports */
import { Observable } from 'rxjs';

/** Custom Services */
import { NavigationService } from './navigation.service';

/**
 * Offices data resolver.
 */
@Injectable()
export class OfficesResolver implements Resolve<Object> {

  /**
   * @param {NavigationService} navigationService Navigation service.
   */
  constructor(private navigationService: NavigationService) {}

  /**
   * Returns the Offices data.
   * @returns {Observable<any>}
   */
  resolve(): Observable<any> {
    return this.navigationService.getOffices();
  }

}
