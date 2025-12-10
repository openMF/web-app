/** Angular Imports */
import { Injectable, inject } from '@angular/core';
import { ActivatedRouteSnapshot } from '@angular/router';

/** rxjs Imports */
import { Observable } from 'rxjs';

/** Custom Services */
import { OrganizationService } from 'app/organization/organization.service';

/**
 * Holiday data resolver.
 */
@Injectable()
export class HolidayResolver {
  private organizationService = inject(OrganizationService);

  /**
   * Returns the holiday data.
   * @returns {Observable<any>}
   */
  resolve(route: ActivatedRouteSnapshot): Observable<any> {
    const holidayId = route.paramMap.get('id');
    return this.organizationService.getHoliday(holidayId);
  }
}
