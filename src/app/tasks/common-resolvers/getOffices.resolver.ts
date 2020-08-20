/** Angular Imports */
import { Injectable } from '@angular/core';
import { Resolve } from '@angular/router';

/** rxjs Imports */
import { Observable } from 'rxjs';

/** Custom Services */
import { TasksService } from '../tasks.service';

/**
 * Offices data resolver.
 */
@Injectable()
export class GetOffices implements Resolve<Object> {

    /**
     * @param {TasksService} tasksService Tasks service.
     */
    constructor(private tasksService: TasksService) { }

    /**
     * Returns the offices data.
     * @returns {Observable<any>}
     */
    resolve(): Observable<any> {
        return this.tasksService.getAllOffices();
    }

}
