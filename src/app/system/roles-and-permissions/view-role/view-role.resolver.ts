/** Angular Imports */
import { Injectable } from '@angular/core';
import { Resolve, ActivatedRouteSnapshot } from '@angular/router';

/** rxjs Imports */
import { Observable } from 'rxjs';

/** Custom Services */
import { SystemService } from '../../system.service';

/**
 * Roles and Permission data resolver.
 */
@Injectable()
export class ViewRoleResolver implements Resolve<Object> {

    /**
     * @param {SystemService} systemService System service.
     */
    constructor(private systemService: SystemService) { }

    /**
     * Returns the roles and permissions data.
     * @returns {Observable<any>}
     */
    resolve(route: ActivatedRouteSnapshot): Observable<any> {
        const id = route.paramMap.get('id');
        return this.systemService.getRole(id);
    }

}
