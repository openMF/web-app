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

}
