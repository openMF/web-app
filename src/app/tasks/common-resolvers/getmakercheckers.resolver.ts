/** Angular Imports */
import { Injectable, inject } from '@angular/core';

/** rxjs Imports */
import { Observable } from 'rxjs';

/** Custom Services */
import { TasksService } from '../tasks.service';

/**
 * Maker Checker Data data resolver.
 */
@Injectable()
export class GetMakerCheckers {
  private tasksService = inject(TasksService);

  /** Inserted by Angular inject() migration for backwards compatibility */
  constructor(...args: unknown[]);

  /**
   * @param {TasksService} tasksService Tasks service.
   */
  constructor() {}

  /**
   * Returns the maker checker data.
   * @returns {Observable<any>}
   */
  resolve(): Observable<any> {
    return this.tasksService.getMakerCheckerData();
  }
}
