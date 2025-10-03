/** Angular Imports */
import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot } from '@angular/router';

/** rxjs Imports */
import { Observable } from 'rxjs';

/** Custom Services */
import { HolidaysService } from '@fineract/client';

/**
 * Holiday data template resolver.
 */
@Injectable()
export class HolidayTemplateResolver {
  /**
   * @param {HolidaysService} holidaysService Holidays service.
   */
  constructor(private holidaysService: HolidaysService) {}

  /**
   * Returns the holiday data.
   * @returns {Observable<any>}
   */
  resolve(): Observable<any> {
    return this.holidaysService.retrieveRepaymentScheduleUpdationTyeOptions();
  }
}
