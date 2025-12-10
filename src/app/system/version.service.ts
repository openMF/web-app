/** Angular Imports */
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';

/** rxjs Imports */
import { Observable } from 'rxjs';

/** Custom Services */
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class VersionService {
  private http = inject(HttpClient);

  private apiActuator = environment.apiActuator;

  getBackendInfo(): Observable<any> {
    return this.http.get(this.apiActuator + '/actuator/info');
  }
}
