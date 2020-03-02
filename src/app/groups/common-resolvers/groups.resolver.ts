/** Angular Imports */
import { Injectable } from '@angular/core';
import { Resolve, ActivatedRouteSnapshot } from '@angular/router';

/** rxjs Imports */
import { Observable } from 'rxjs';

/** Custom Services */
import { GroupsService } from '../groups.service';

/**
 * Groups data resolver.
 */
@Injectable()
export class GroupsResolver implements Resolve<Object> {

    /**
     * @param {GroupsService} GroupsService Groups service.
     */
    constructor(private groupsService: GroupsService) { }

    /**
     * Returns the Groups data.
     * @returns {Observable<any>}
     */
    resolve(route: ActivatedRouteSnapshot): Observable<any> {
        return this.groupsService.getGroups();
    }

}
