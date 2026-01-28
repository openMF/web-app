/** Angular Imports */
import { Injectable } from '@angular/core';

/** rxjs Imports */
import { Observable } from 'rxjs';

/** Custom Services */
import { OfficesService } from '@fineract/client';

/**
 * Offices data resolver.
 */
@Injectable()
export class GetOffices {
  /**
   * @param {OfficesService} officesService Offices service.
   */
  constructor(private officesService: OfficesService) {}

  /**
   * Returns the offices data.
   * @returns {Observable<any>}
   */
  resolve(): Observable<any> {
    return this.officesService.retrieveOffices();
  }
}
