/** Angular Imports */
import { Injectable, inject } from '@angular/core';

/** rxjs Imports */
import { Observable } from 'rxjs';

/** Custom Services */
import { TasksService } from '../tasks.service';

/**
 * Grouped Client Data data resolver.
 */
@Injectable()
export class GetGroupedClientsData {
  private tasksService = inject(TasksService);

  /** Inserted by Angular inject() migration for backwards compatibility */
  constructor(...args: unknown[]);

  /**
   * @param {TasksService} tasksService Tasks service.
   */
  constructor() {}

  /**
   * Returns the grouped client data.
   * @returns {Observable<any>}
   */
  resolve(): Observable<any> {
    return this.tasksService.getGroupedClientsData();
  }
}
