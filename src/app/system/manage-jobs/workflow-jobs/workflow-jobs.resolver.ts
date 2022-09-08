import { Injectable } from '@angular/core';
import { Resolve, ActivatedRouteSnapshot } from '@angular/router';
import { SystemService } from 'app/system/system.service';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class WorkflowJobResolver implements Resolve<boolean> {

  /**
   * @param {SystemService} systemService System service.
   */
   constructor(private systemService: SystemService) {}

   /**
    * Returns the Configuration data.
    * @returns {Observable<any>}
    */
   resolve(route: ActivatedRouteSnapshot): Observable<any> {
     return this.systemService.getWorkflowJobNames();
   }

}
