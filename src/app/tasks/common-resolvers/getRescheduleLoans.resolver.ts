/** Angular Imports */
import { Injectable } from '@angular/core';
import { Resolve } from '@angular/router';

/** rxjs Imports */
import { Observable } from 'rxjs';

/** Custom Services */
import { TasksService } from '../tasks.service';

/**
 * Pending Reschedule Loans data resolver.
 */
@Injectable()
export class GetRescheduleLoans implements Resolve<Object> {

    /**
     * @param {TasksService} tasksService Tasks service.
     */
    constructor(private tasksService: TasksService) { }

    /**
     * Returns the pending reschedule data.
     * @returns {Observable<any>}
     */
    resolve(): Observable<any> {
        return this.tasksService.getPendingRescheduleLoans();
    }

}
