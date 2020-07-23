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

  getStandingInstructionsTemplate(clientId: any, officeId: any, accountTypeId: string, formValue?: any): Observable<any> {
    let httpParams = new HttpParams().set('fromAccountType', accountTypeId)
                                       .set('fromClientId', clientId)
                                       .set('fromOfficeId', officeId);
    if (formValue) {
      const propNames = Object.getOwnPropertyNames(formValue);
      for (let i = 0; i < propNames.length; i++) {
        const propName = propNames[i];
        httpParams = httpParams.set(propName, formValue[propName]);
      }
    }
    return this.http.get(`/standinginstructions/template`, { params: httpParams });
  }

  createStandingInstructions(data: Object): Observable<any> {
    return this.http.post(`/standinginstructions`, data);
  }

  newAccountTranferResource(id: any, accountTypeId: any, formValue?: any): Observable<any> {
    let httpParams = new HttpParams().set('fromAccountId', id)
      .set('fromAccountType', accountTypeId);
    if (formValue) {
      const propNames = Object.getOwnPropertyNames(formValue);
      for (let i = 0; i < propNames.length; i++) {
        const propName = propNames[i];
        httpParams = httpParams.set(propName, formValue[propName]);
      }
    }
    return this.http.get(`/accounttransfers/template`, { params: httpParams });

  }

  createAccountTransfer(data: any): Observable<any> {
    return this.http.post(`/accounttransfers`, data);
  }

}
