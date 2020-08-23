/** Angular Imports */
import { Injectable } from '@angular/core';
import { Resolve } from '@angular/router';

/** rxjs Imports */
import { Observable } from 'rxjs';

/** Custom Services */
import { TasksService } from '../tasks.service';

/**
 * Loans data resolver.
 */
@Injectable()
export class GetLoans implements Resolve<Object> {

    /**
     * @param {TasksService} tasksService Tasks service.
     */
    constructor(private tasksService: TasksService) { }

    /**
     * Returns all the loans data.
     * @returns {Observable<any>}
     */
    resolve(): Observable<any> {
        return this.tasksService.getAllLoans();
    }

}
