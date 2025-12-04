/** Angular Imports */
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';

/** rxjs Imports */
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class VersionService {
  private http = inject(HttpClient);

  getBackendInfo(): Observable<any> {
    return this.http.get('/fineract-provider/actuator/info');
  }
}
