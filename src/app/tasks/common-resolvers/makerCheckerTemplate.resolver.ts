/** Angular Imports */
import { Injectable, inject } from '@angular/core';

/** rxjs Imports */
import { Observable } from 'rxjs';

/** Custom Services */
import { TasksService } from '../tasks.service';

/**
 * Maker Checker Template resolver.
 */
@Injectable()
export class MakerCheckerTemplate {
  private tasksService = inject(TasksService);

  /**
   * Returns the maker checker template data.
   * @returns {Observable<any>}
   */
  resolve(): Observable<any> {
    return this.tasksService.getMakerCheckerTemplate();
  }
}
