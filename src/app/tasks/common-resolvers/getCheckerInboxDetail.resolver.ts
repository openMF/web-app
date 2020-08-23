/** Angular Imports */
import { Injectable } from '@angular/core';
import { Resolve, ActivatedRouteSnapshot } from '@angular/router';

/** rxjs Imports */
import { Observable } from 'rxjs';

/** Custom Services */
import { TasksService } from '../tasks.service';

/**
 * Checker Inbox Detail resolver.
 */
@Injectable()
export class GetCheckerInboxDetailResolver implements Resolve<Object> {

    /**
     * @param {TasksService} tasksService Tasks service.
     */
    constructor(private tasksService: TasksService) { }

    /**
     * Returns the detail data of the checker inbox.
     * @returns {Observable<any>}
     */
    resolve(route: ActivatedRouteSnapshot): Observable<any> {
        const checkerId = route.paramMap.get('id');
        return this.tasksService.getCheckerInboxDetail(checkerId);
    }

}
