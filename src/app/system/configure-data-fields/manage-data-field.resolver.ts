import { Injectable } from '@angular/core';
import {
   Resolve
} from '@angular/router';
import { Observable } from 'rxjs';
import { SystemService } from '../system.service';

@Injectable({
  providedIn: 'root'
})
export class ManageDataFieldResolver implements Resolve<Object> {
  /**
   * @param {SystemService} systemService System service.
   */
  constructor(private systemService: SystemService) {}

  /**
   * Returns the manage data field config data.
   * @returns {Observable<any>}
   */
  resolve(): Observable<any> {
    return this.systemService.getFieldConfiguration();
  }
}
