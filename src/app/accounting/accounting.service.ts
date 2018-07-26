import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AccountingService {

  constructor(private http: HttpClient) { }

  getOffices(): Observable<any> {
    return  this.http.get('/offices?orderBy=id');
  }

  getAccountingRules(): Observable<any> {
    return this.http.get('/accountingrules?associations=all');
  }

  getCurrencies(): Observable<any> {
    return this.http.get('/currencies');
  }

  getPaymentTypes(): Observable<any> {
    return this.http.get('/paymenttypes');
  }

  createJournalEntry(journalEntry: any): Observable<any> {
    return this.http.post('/journalentries', journalEntry);
  }

  getJournalEntry(transactionId: string) {
    let httpParams = new HttpParams();
    httpParams = httpParams.set('transactionId', transactionId);
    httpParams = httpParams.set('transactionDetails', 'true');
    return this.http.get(`/journalentries`, { params: httpParams });
  }

  // filterBy: officeId, glAccountId, manualEntriesOnly, fromDate, toDate, transactionId
  getJournalEntries(filterBy: any, orderBy: any, sortBy: any, offset: number, limit: number) {
    console.log('Order By:', orderBy);
    console.log('Sort By:', sortBy);
    console.log('Filter By:', filterBy);
    let httpParams = new HttpParams()
      .set('offset', offset.toString())
      .set('limit', limit.toString())
      .set('sortBy', sortBy)
      .set('orderBy', orderBy);
    filterBy.forEach(function (filter: any) {
      if(filter.value) {
        httpParams = httpParams.set(filter.type, filter.value);
      }
    });
    return this.http.get('/journalentries', {
      params: httpParams
    });
  }

  revertTransaction(transactionId: string, comments: string) {
    let httpParams = new HttpParams();
    httpParams = httpParams.set('command', 'reverse');
    let data = {};
    if (comments) {
      data = { comments: comments };
    }
    return this.http.post(`/journalentries/${transactionId}`, data, { params: httpParams });
  }

  getGlAccounts() {
    let httpParams = new HttpParams();
    httpParams = httpParams.set('manualEntriesAllowed', 'true');
    httpParams = httpParams.set('usage', '1');
    httpParams = httpParams.set('disabled', 'false');
    return this.http.get(`/glaccounts`, { params: httpParams });
  }

}
