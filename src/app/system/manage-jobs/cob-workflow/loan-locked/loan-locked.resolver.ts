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
  constructor(private tasksService: TasksService) {}

  /**
   * Returns all the loans data.
   * @returns {Observable<any>}
   */
  resolve(): Observable<any> {
    return this.tasksService.getAllLoansLocked(0, 200);
  }
}
