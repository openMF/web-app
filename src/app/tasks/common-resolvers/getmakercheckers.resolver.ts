/** Angular Imports */
import { Injectable } from '@angular/core';
import { Resolve } from '@angular/router';

/** rxjs Imports */
import { Observable } from 'rxjs';

/** Custom Services */
import { TasksService } from '../tasks.service';

/**
 * Maker Checker Data data resolver.
 */
@Injectable()
export class GetMakerCheckers implements Resolve<Object> {

  /**
   * @param {TasksService} tasksService Tasks service.
   */
  constructor(private tasksService: TasksService) {}

  /**
   * Returns the maker checker data.
   * @returns {Observable<any>}
   */
  resolve(): Observable<any> {
    return this.tasksService.getMakerCheckerData();
  }

}
