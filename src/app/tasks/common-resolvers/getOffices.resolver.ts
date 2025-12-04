/** Angular Imports */
import { Injectable, inject } from '@angular/core';

/** rxjs Imports */
import { Observable } from 'rxjs';

/** Custom Services */
import { TasksService } from '../tasks.service';

/**
 * Offices data resolver.
 */
@Injectable()
export class GetOffices {
  private tasksService = inject(TasksService);

  /**
   * Returns the offices data.
   * @returns {Observable<any>}
   */
  resolve(): Observable<any> {
    return this.tasksService.getAllOffices();
  }
}
