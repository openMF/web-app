/** Angular Imports */
import { Injectable } from '@angular/core';
import { Resolve } from '@angular/router';

/** rxjs Imports */
import { Observable } from 'rxjs';

/** Custom Services */
import { } from '../../offices/offices.component'
import { OrganizationService } from 'app/organization/organization.service';
/**
 * Countries data resolver.
 */
@Injectable()
export class CountriesResolver implements Resolve<Object> {

    /**
     * @param {OrganizationService} OrganizationService Organization service.
     */
    constructor(private organizationService: OrganizationService) { }

    /**
     * Returns the Countries data.
     * @returns {Observable<any>}
     */
    resolve(): Observable<any> {
        return this.organizationService.getCountries();
    }

}
