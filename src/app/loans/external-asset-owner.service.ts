import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ExternalAssetOwnerService {

  constructor(private http: HttpClient) { }

  /**
   * @param {string} loanId Loan Id
   * @param {string} command Command
   * @param {any} data Data
   * @returns {Observable<any>}
   */
  executeExternalAssetOwnerLoanCommand(loanId: string, data: any, command: string): Observable<any> {
    const httpParams = new HttpParams().set('command', command);
    return this.http.post(`/external-asset-owners/transfers/loans/${loanId}`, data, { params: httpParams });
  }

  /**
   * @param {string} transferId Transfer Id
   * @param {string} command Command
   * @param {any} data Data
   * @returns {Observable<any>}
   */
  executeExternalAssetOwnerTransferCommand(transferId: string, data: any, command: string): Observable<any> {
    const httpParams = new HttpParams().set('command', command);
    return this.http.post(`/external-asset-owners/transfers/${transferId}`, data, { params: httpParams });
  }

  /**
   * @param {string} loanId Loan Id
   * @returns {Observable<any>}
   */
  retrieveExternalAssetOwnerTransfers(loanId: string): Observable<any> {
    const httpParams = new HttpParams().set('loanId', loanId);
    return this.http.get(`/external-asset-owners/transfers`, { params: httpParams });
  }

  /**
   * @param {string} loanId Loan Id
   * @returns {Observable<any>}
   */
  retrieveExternalAssetOwnerActiveTransfer(loanId: string): Observable<any> {
    const httpParams = new HttpParams().set('loanId', loanId);
    return this.http.get(`/external-asset-owners/transfers/active-transfer`, { params: httpParams });
  }

  /**
   * @param {string} transferId Transfer Id
   * @returns {Observable<any>}
   */
  retrieveExternalAssetOwnerTransferJournalEntries(transferId: string): Observable<any> {
    return this.http.get(`/external-asset-owners/transfers/${transferId}/journal-entries`);
  }

}
