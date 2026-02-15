/** Angular Imports */
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { map, Observable, switchMap } from 'rxjs';
import { environment } from '../environments/environment';
import { ChartData } from './reports/common-models/chart-data.model';
import { ReportParameter } from './reports/common-models/report-parameter.model';
import { SelectOption } from './reports/common-models/select-option.model';

// loans.service.ts
@Injectable({
  providedIn: 'root'
})
export class LoansService {
  constructor(private http: HttpClient) {}

  //not available in the fineract.yaml (pr by alberto #2564)
  getDeferredIncomeData(loanId: string) {
    return this.http.get(`/loans/${loanId}/deferredincome`);
  }

  /**
   * @param {string} accountId Loans Account Id
   * @param {string} command Command
   * @param {any} data Data
   * @param {string} transactionId Transaction Id
   * @returns {Observable<any>}
   */

  // did not find this in endpoint in fineract.yaml ( transactions-tab.component.ts)
  executeLoansAccountTransactionsCommand(
    accountId: string,
    command: string,
    data: any,
    transactionId?: any
  ): Observable<any> {
    const httpParams = new HttpParams().set('command', command);
    if (transactionId) {
      return this.http.post(`/loans/${accountId}/transactions/${transactionId}`, data, { params: httpParams });
    }
    return this.http.post(`/loans/${accountId}/transactions`, data, { params: httpParams });
  }

  // did not find this /loans/${loanId}/documents endpoint in fineract.yaml (loan-documents-tab.component.ts)

  //I tried to use   /v1/{entityType}/{entityId}/documents: insted of /loans/{loanId}/documents, but there was issue The problem is that the OpenAPI client expects the file field as uploadedInputStream, but the backend expects the field to be named InputStream. This mismatch causes the 400 error.

  loadLoanDocument(loanId: any, data: any): Observable<any> {
    return this.http.post(`/loans/${loanId}/documents`, data);
  }

  downloadLoanDocument(parentEntityId: string, documentId: string) {
    return this.http.get(`/loans/${parentEntityId}/documents/${documentId}/attachment`, { responseType: 'blob' });
  }

  deleteLoanDocument(loanId: any, documentId: any): Observable<any> {
    return this.http.delete(`/loans/${loanId}/documents/${documentId}`);
  }

  // did not find this in endpoint in fineract.yaml (notes-tab.component.ts)
  /**
   * Adds a note to the particular Loan Id
   * @param loanId Loan ID
   * @param noteData Note Data to be added
   * @returns {Observable<any>}
   */
  createLoanNote(loanId: string, noteData: any): Observable<any> {
    return this.http.post(`/loans/${loanId}/notes`, noteData);
  }

  /**
   * Edits the Loan Note
   * @param loanId Loan ID
   * @param noteId Note ID
   * @param noteData Note Data
   */
  editLoanNote(loanId: string, noteId: string, noteData: any) {
    return this.http.put(`/loans/${loanId}/notes/${noteId}`, noteData);
  }

  /**
   * Deletes the particular Note
   * @param loanId Loan ID
   * @param noteId Note ID
   */
  deleteLoanNote(loanId: string, noteId: string) {
    return this.http.delete(`/loans/${loanId}/notes/${noteId}`);
  }

  getBuyDownFeeData(loanId: string): Observable<any> {
    return this.http.get(`/loans/${loanId}/buydown-fees`);
  }
}

/**
 * Reports service.
 */
@Injectable({
  providedIn: 'root'
})
export class ReportsService {
  /**
   * @param {HttpClient} http Http Client to send requests.
   */
  constructor(private http: HttpClient) {}

  /**
   * @param {string} reportName Report name for which parameters are needed.
   * @returns {Observable<ReportParameter[]>}
   */
  getReportParams(reportName: string): Observable<ReportParameter[]> {
    const httpParams = new HttpParams().set('R_reportListing', `'${reportName}'`).set('parameterType', 'true');
    return this.http
      .get(`/runreports/FullParameterList`, { params: httpParams })
      .pipe(map((response: any) => response.data.map((entry: any) => new ReportParameter(entry.row))));
  }

  /**
   * @param {string} inputString URL substring containing object details.
   * @returns {Observable<SelectOption[]>}
   */
  getSelectOptions(inputString: string): Observable<SelectOption[]> {
    const httpParams = new HttpParams().set('parameterType', 'true');
    return this.http
      .get(`/runreports/${inputString}`, { params: httpParams })
      .pipe(map((response: any) => response.data.map((entry: any) => new SelectOption(entry.row))));
  }

  /**
   * Run Report Data for Table and SMS.
   * @param {any} reportName report name
   * @param {object} formData Form Data.
   * @returns {Observable<any>}
   */
  getRunReportData(reportName: string, formData: object): Observable<any> {
    let httpParams = new HttpParams();
    for (const [
      key,
      value
    ] of Object.entries(formData)) {
      httpParams = httpParams.set(key, value);
    }
    return this.http.get(`/runreports/${reportName}`, { params: httpParams });
  }

  /**
   * Run Report Data for Charts.
   * @param {any} reportName report name
   * @param {object} formData Form Data.
   * @returns {Observable<ChartData>}
   */
  getChartRunReportData(reportName: string, formData: object): Observable<ChartData> {
    let httpParams = new HttpParams();
    for (const [
      key,
      value
    ] of Object.entries(formData)) {
      httpParams = httpParams.set(key, value);
    }
    return this.http
      .get(`/runreports/${reportName}`, { params: httpParams })
      .pipe(map((response: any) => new ChartData(response)));
  }

  /**
   * Run Report Data for Pentaho.
   * @param {any} reportName report name
   * @param {object} formData Form Data.
   * @returns {Observable<any>}
   */
  getPentahoRunReportData(
    reportName: string,
    formData: object,
    tenantIdentifier: string,
    locale: string,
    dateFormat: string
  ): Observable<any> {
    let httpParams = new HttpParams()
      .set('tenantIdentifier', tenantIdentifier)
      .set('locale', locale)
      .set('dateFormat', dateFormat);
    for (const [
      key,
      value
    ] of Object.entries(formData)) {
      httpParams = httpParams.set(key, value);
    }
    return this.http.get(`/runreports/${reportName}`, {
      responseType: 'arraybuffer',
      observe: 'response',
      params: httpParams
    });
  }

  /**
   * @param {number} staffId Staff Id to get centers from.
   * @returns {Observable<any>} Centers
   */
  getCentersFromStaffId(staffId: number): Observable<any> {
    const httpParams = new HttpParams().set('R_staffId', staffId.toString()).set('genericResultSet', 'false');
    return this.http.get('/runreports/GroupNamesByStaff', { params: httpParams });
  }

  /**
   * @param {number} centerId Center ID of center
   * @returns {Observable<any>} Center
   */
  getCenter(centerId: number): Observable<any> {
    const httpParams = new HttpParams().set('associations', 'groupMembers');
    return this.http.get(`/centers/${centerId}`, { params: httpParams });
  }

  /**
   * @param {number} centerId Center ID of center to retrieve summary of
   * @returns {Observable<any>} Center Summary
   */
  getCenterSummary(centerId: number): Observable<any> {
    const httpParams = new HttpParams().set('R_groupId', centerId.toString()).set('genericResultSet', 'false');
    return this.http.get('/runreports/GroupSummaryCounts', { params: httpParams });
  }
}

@Injectable({
  providedIn: 'root'
})
export class GroupsService {
  constructor(private http: HttpClient) {}

  /**
   * @param {string} groupId Group Id
   * @param {string} command Command
   * @param {any} data Command payload
   * @returns {Observable<any>}
   */
  executeGroupCommand(groupId: string, command: string, data: any): Observable<any> {
    const httpParams = new HttpParams().set('command', command);
    return this.http.post(`/groups/${groupId}`, data, { params: httpParams });
  }
}

/**
 * Account Transfers Service.
 */
@Injectable({
  providedIn: 'root'
})
export class AccountTransfersService {
  constructor(private http: HttpClient) {}

  deleteStandingInstrucions(id: any) {
    const httpParams = new HttpParams().set('command', 'delete');
    return this.http.delete(`/standinginstructions/${id}`, { params: httpParams });
  }

  sendInterbankTransfer(body: any): Observable<any> {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    return this.http.post(
      `${environment.vNextApiUrl}${environment.vNextApiVersion}${environment.vNextApiProvider}/executetransfer`,
      body,
      { headers }
    );
  }

  getAccountByNumber(accountNumber: string, currency: string): Observable<any> {
    const payload = {
      partyId: accountNumber,
      partyIdType: 'MSISDN',
      currencyCode: currency
    };
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    return this.http
      .post(
        `${environment.vNextApiUrl}${environment.vNextApiVersion}${environment.vNextApiProvider}/participant`,
        JSON.stringify(payload),
        { headers }
      )
      .pipe(
        switchMap((participant: any) => {
          const body = JSON.stringify({ ...payload, ownerFspId: participant.fspId });
          return this.http.post(
            `${environment.vNextApiUrl}${environment.vNextApiVersion}${environment.vNextApiProvider}/partyinfo`,
            body,
            { headers }
          );
        })
      );
  }
}

@Injectable({
  providedIn: 'root'
})
export class OrganizationService {
  constructor(
    private http: HttpClient,
    private settingsService: any
  ) {}

  /**
   * @param urlSuffix of Bulk-Import
   * @param officeId Office ID for template retrieval
   * @param staffId Staff ID for template retrieval
   * @param legalFormType Legal Form type fortemplate retrieval
   * @returns {Observable<any>} Import Template
   */
  getImportTemplate(urlSuffix: string, officeId: any, staffId: any, legalFormType: string): Observable<any> {
    let httpParams = new HttpParams()
      .set('tenantIdentifier', 'default')
      .set('locale', this.settingsService.language.code)
      .set('dateFormat', this.settingsService.dateFormat);
    if (officeId) {
      httpParams = httpParams.set('officeId', officeId.toString());
    }
    if (staffId) {
      httpParams = httpParams.set('staffId', staffId.toString());
    }
    if (legalFormType.length) {
      httpParams = httpParams.set('legalFormType', legalFormType);
    }
    return this.http.get(`${urlSuffix}/downloadtemplate`, {
      params: httpParams,
      responseType: 'arraybuffer',
      observe: 'response'
    });
  }
}
@Injectable({
  providedIn: 'root'
})
export class SystemService {
  constructor(private http: HttpClient) {}
  getExternalEventConfiguration(): Observable<any> {
    return this.http.get('/externalevents/configuration');
  }
}

@Injectable({
  providedIn: 'root'
})
export class SharesService {
  constructor(private http: HttpClient) {}

  /**
   * @param {string} accountId shares account Id
   * @returns {Observable<any>}
   */
  deleteSharesAccount(accountId: string): Observable<any> {
    return this.http.delete(`/accounts/share/${accountId}`);
  }
}

/**
 * Savings Service
 */
@Injectable({
  providedIn: 'root'
})
export class SavingsService {
  constructor(private http: HttpClient) {}

  /**
   * @param {any} savingsAccount Savings Account
   * @returns {Observable<any>}
   */
  createSavingsAccount(savingsAccount: any): Observable<any> {
    return this.http.post('/savingsaccounts', savingsAccount);
  }
}

@Injectable({
  providedIn: 'root'
})
export class HomeService {
  /**
   * @param {HttpClient} http Http Client to send requests.
   */
  constructor(private http: HttpClient) {}

  /**
   * @param {number} officeId Office Id.
   * @returns {Observable<any>}
   */
  getCollectedAmount(officeId: number): Observable<any> {
    const httpParams = new HttpParams().set('R_officeId', officeId.toString()).set('genericResultSet', 'false');
    return this.http.get('/runreports/Demand Vs Collection', { params: httpParams });
  }

  getDisbursedAmount(officeId: number): Observable<any> {
    const httpParams = new HttpParams().set('R_officeId', officeId.toString()).set('genericResultSet', 'false');
    return this.http.get('/runreports/Disbursal Vs Awaitingdisbursal', { params: httpParams });
  }

  /**
   * @param {number} officeId Office Id.
   * @returns {Observable<any>}
   */

  getClientTrendsByDay(officeId: number): Observable<any> {
    const httpParams = new HttpParams().set('R_officeId', officeId.toString()).set('genericResultSet', 'false');
    return this.http.get('/runreports/ClientTrendsByDay', { params: httpParams });
  }

  getLoanTrendsByDay(officeId: number): Observable<any> {
    const httpParams = new HttpParams().set('R_officeId', officeId.toString()).set('genericResultSet', 'false');
    return this.http.get('/runreports/LoanTrendsByDay', { params: httpParams });
  }

  getClientTrendsByWeek(officeId: number): Observable<any> {
    const httpParams = new HttpParams().set('R_officeId', officeId.toString()).set('genericResultSet', 'false');
    return this.http.get('/runreports/ClientTrendsByWeek', { params: httpParams });
  }

  getClientTrendsByMonth(officeId: number): Observable<any> {
    const httpParams = new HttpParams().set('R_officeId', officeId.toString()).set('genericResultSet', 'false');
    return this.http.get('/runreports/ClientTrendsByMonth', { params: httpParams });
  }

  getLoanTrendsByWeek(officeId: number): Observable<any> {
    const httpParams = new HttpParams().set('R_officeId', officeId.toString()).set('genericResultSet', 'false');
    return this.http.get('/runreports/LoanTrendsByWeek', { params: httpParams });
  }

  getLoanTrendsByMonth(officeId: number): Observable<any> {
    const httpParams = new HttpParams().set('R_officeId', officeId.toString()).set('genericResultSet', 'false');
    return this.http.get('/runreports/LoanTrendsByMonth', { params: httpParams });
  }
}
