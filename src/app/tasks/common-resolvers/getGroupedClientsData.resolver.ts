/** Angular Imports */
import { Injectable } from '@angular/core';
import { Resolve } from '@angular/router';

/** rxjs Imports */
import { Observable } from 'rxjs';

/** Custom Services */
import { TasksService } from '../tasks.service';

/**
 * Grouped Client Data data resolver.
 */
@Injectable()
export class GetGroupedClientsData implements Resolve<Object> {

  /**
   * @param {TasksService} tasksService Tasks service.
   */
  constructor(private tasksService: TasksService) {}

  /**
   * Returns the grouped client data.
   * @returns {Observable<any>}
   */
  resolve(): Observable<any> {
    return this.tasksService.getGroupedClientsData();
  }

}
