/** Angular Imports */
import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot } from '@angular/router';

/** rxjs Imports */
import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';

/** Custom Services */
import { CentersService } from '@fineract/client';

/**
 * Center resource resolver.
 */
@Injectable()
export class CenterResourceResolver {
  /**
   * @param {CentersService} centersService Centers service.
   */
  constructor(private centersService: CentersService) {}

  /**
   * Returns the Center data.
   * @returns {Observable<any>}
   */
  resolve(route: ActivatedRouteSnapshot): Observable<any> {
    const centerId = route.paramMap.get('centerId');
    return this.centersService
      .retrieveOne14({
        centerId: parseInt(centerId, 10),
        associations: 'groupMembers,collectionMeetingCalendar'
      } as any)
      .pipe(catchError(() => of({})));
  }
}
