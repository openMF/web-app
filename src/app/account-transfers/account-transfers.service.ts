/** Angular Imports */
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';

/** rxjs Imports */
import { Observable } from 'rxjs';

/**
 * Account Transfers Service.
 */
@Injectable({
  providedIn: 'root'
})
export class AccountTransfersService {

  constructor(private http: HttpClient) { }

  /**
   * @params standingInstructionsId
   * Returns the details of a particular Standing Instruction
   */
  getStandingInstructionsData(standingInstructionsId: any): Observable<any> {
    return this.http.get(`/standinginstructions/${standingInstructionsId}`);
  }

  getStandingInstructionsDataAndTemplate(standingInstructionsId: any): Observable<any> {
    const httpParams = new HttpParams().set('associations', 'template');
    return this.http.get(`/standinginstructions/${standingInstructionsId}`, { params: httpParams });
  }

  updateStandingInstructionsData(standinginstructionsId: any, data: any): Observable<any> {
    const httpParams = new HttpParams().set('command', 'update');
    return this.http.put(`/standinginstructions/${standinginstructionsId}`, data, { params: httpParams });
  }

}
