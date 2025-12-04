import { Injectable, inject } from '@angular/core';
import { Router, RouterStateSnapshot, ActivatedRouteSnapshot } from '@angular/router';
import { Observable, of } from 'rxjs';
import { SystemService } from '../system.service';

@Injectable({
  providedIn: 'root'
})
export class ManageExternalEventsResolver {
  private systemService = inject(SystemService);

  /**
   * Returns the Configuration data.
   * @returns {Observable<any>}
   */
  resolve(route: ActivatedRouteSnapshot): Observable<any> {
    return this.systemService.getExternalEventConfiguration();
  }
}
