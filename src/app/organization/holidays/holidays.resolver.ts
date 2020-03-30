/** Angular Imports */
import { Injectable } from '@angular/core';
import { Resolve } from '@angular/router';

/** rxjs Imports */
import { Observable } from 'rxjs';

/** Custom Services */
import { OrganizationService } from '../organization.service';

/**
 * Holidays data resolver.
 */
@Injectable()
export class HolidaysResolver implements Resolve<Object> {

    /**
     * @param {OrganizationService} organizationService Organization service.
     */
    constructor(private organizationService: OrganizationService) { }

    /**
     * Returns the holidays data.
     * @returns {Observable<any>}
     */
    resolve(): Observable<any> {
        return this.organizationService.getHolidays();
    }

}
