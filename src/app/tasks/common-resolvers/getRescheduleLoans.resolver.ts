/** Angular Imports */
import { Injectable, inject } from '@angular/core';

/** rxjs Imports */
import { Observable } from 'rxjs';

/** Custom Services */
import { TasksService } from '../tasks.service';

/**
 * Pending Reschedule Loans data resolver.
 */
@Injectable()
export class GetRescheduleLoans {
  private tasksService = inject(TasksService);

  /**
   * Returns the pending reschedule data.
   * @returns {Observable<any>}
   */
  resolve(): Observable<any> {
    return this.tasksService.getPendingRescheduleLoans();
  }
}
