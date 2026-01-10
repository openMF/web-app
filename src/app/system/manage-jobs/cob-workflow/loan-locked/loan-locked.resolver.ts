/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { Injectable } from '@angular/core';
import { Router, RouterStateSnapshot, ActivatedRouteSnapshot } from '@angular/router';
import { TasksService } from 'app/tasks/tasks.service';
import { Observable, of } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class LoanLockedResolver {
  /**
   * @param {TasksService} tasksService Tasks service.
   */
  // eslint-disable-next-line @angular-eslint/prefer-inject
  constructor(private tasksService: TasksService) {}

  /**
   * Returns all the loans data.
   * @returns {Observable<any>}
   */
  resolve(): Observable<any> {
    return this.tasksService.getAllLoansLocked(0, 200);
  }
}
