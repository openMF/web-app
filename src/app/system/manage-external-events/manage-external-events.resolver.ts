import { Injectable } from '@angular/core';
import {
  Router, Resolve,
  RouterStateSnapshot,
  ActivatedRouteSnapshot
} from '@angular/router';
import { Observable, of } from 'rxjs';
import { SystemService } from '../system.service';

@Injectable({
  providedIn: 'root'
})
export class ManageExternalEventsResolver implements Resolve<boolean> {

  /**
   * @param {SystemService} systemService System service.
   */
   constructor(private systemService: SystemService) {}

   /**
    * Returns the Configuration data.
    * @returns {Observable<any>}
    */
   resolve(route: ActivatedRouteSnapshot): Observable<any> {
     return this.systemService.getExternalEventConfiguration();
   }
}
