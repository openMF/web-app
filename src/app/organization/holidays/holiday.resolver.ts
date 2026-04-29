/** Angular Imports */
import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot } from '@angular/router';

/** rxjs Imports */
import { Observable } from 'rxjs';

/** Custom Services */
import { HolidaysService } from '@fineract/client';

/**
 * Holiday data resolver.
 */
@Injectable()
export class HolidayResolver {
  /**
   * @param {HolidaysService} holidaysService Holidays service.
   */
  constructor(private holidaysService: HolidaysService) {}

  /**
   * Returns the holiday data.
   * @returns {Observable<any>}
   */
  resolve(route: ActivatedRouteSnapshot): Observable<any> {
    const holidayId = route.paramMap.get('id');
    return this.holidaysService.retrieveAllHolidays({ officeId: holidayId ? Number(holidayId) : undefined });
  }
}
