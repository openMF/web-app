/** Angular Imports */
import { Injectable, inject } from '@angular/core';
import { ActivatedRouteSnapshot } from '@angular/router';

/** rxjs Imports */
import { Observable } from 'rxjs';

/** Custom Services */
import { TasksService } from '../tasks.service';

/**
 * Checker Inbox Detail resolver.
 */
@Injectable()
export class GetCheckerInboxDetailResolver {
  private tasksService = inject(TasksService);

  /**
   * Returns the detail data of the checker inbox.
   * @returns {Observable<any>}
   */
  resolve(route: ActivatedRouteSnapshot): Observable<any> {
    const checkerId = route.paramMap.get('id');
    return this.tasksService.getCheckerInboxDetail(checkerId);
  }
}
