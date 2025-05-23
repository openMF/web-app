/** Angular Imports */
import { Injectable } from '@angular/core';

/** rxjs Imports */
import { Observable } from 'rxjs';

/** Custom Services */
import { TasksService } from '../tasks.service';

/**
 * Pending Reschedule Loans data resolver.
 */
@Injectable()
export class GetRescheduleLoans {
  /**
   * @param {TasksService} tasksService Tasks service.
   */
  constructor(private tasksService: TasksService) {}

  /**
   * Returns the pending reschedule data.
   * @returns {Observable<any>}
   */
  resolve(): Observable<any> {
    return this.tasksService.getPendingRescheduleLoans();
  }
}
