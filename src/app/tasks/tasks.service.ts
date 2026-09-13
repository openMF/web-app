/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

/** Angular Imports */
import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';

/** rxjs Imports */
import { map, Observable } from 'rxjs';

/**
 * `/makercheckers` and `/audits/{id}` return the `AuditData` DTO straight from the
 * resource, so Jackson serialises its `ZonedDateTime` as epoch seconds
 * (`1789064261.492617`). The `/audits` list goes through Gson's `JodaDateTimeAdapter`
 * and sends epoch milliseconds. The date pipes read a bare number as milliseconds, so
 * the seconds form renders as a 1970 date.
 *
 * Converted here, where the endpoint fixes the unit, rather than in the shared pipe:
 * a millisecond value from before September 2001 is numerically indistinguishable from
 * a seconds value, so no magnitude check further down can tell them apart.
 */
function madeOnDateToMillis(record: any): any {
  if (typeof record?.madeOnDate !== 'number') {
    return record;
  }
  return { ...record, madeOnDate: Math.round(record.madeOnDate * 1000) };
}

export interface EnrollmentCasesSearchParams {
  view: 'enrollment';
  clientId?: number | string;
  offset?: number;
  limit?: number;
}

export interface EnrollmentCasesResponse {
  totalFilteredRecords?: number;
  pageItems?: EnrollmentCase[];
}

export interface EnrollmentCase {
  clientId?: number | string;
  clientName?: string;
  officeId?: number | string;
  clientLifecycleStatus?: string | { code?: string; value?: string; id?: number | string };
  enrollmentStages?: EnrollmentStage[];
  kycEvidence?: KycEvidence;
}

export interface EnrollmentStage {
  name?: string;
  status?: string | { code?: string; value?: string; id?: number | string };
  startedAt?: string | number[];
  completedAt?: string | number[];
  source?: string;
  aging?: Aging | null;
}

export interface Aging {
  days?: number;
  trafficLight?: string;
  source?: string;
}

export interface KycEvidence {
  verificationSessionId?: string | number;
  sessionId?: string | number;
  providerDecisionStatus?: string;
  providerKycDecision?: string;
  derivedKycStatus?: string;
  faceMatchStatus?: string;
  faceMatch?: { status?: string; decision?: string };
  idVerificationStatus?: string;
  idVerification?: { status?: string; decision?: string };
  amlScreeningStatus?: string;
  amlScreening?: { status?: string; decision?: string };
}

export interface PendingProspectsSearchParams {
  q?: string;
  registrationStatus?: string;
  createdFrom?: string;
  createdTo?: string;
  offset?: number;
  limit?: number;
  orderBy?: string;
  sortOrder?: string;
}

export interface PendingProspectsResponse {
  totalFilteredRecords?: number;
  pageItems?: PendingProspect[];
}

export interface PendingProspect {
  prospectId?: number | string;
  externalRef?: string;
  displayName?: string;
  officeId?: number | string;
  clientId?: number | string;
  registrationStatus?: string;
  createdAt?: string | number[];
  submittedAt?: string | number[];
  lastUpdatedAt?: string | number[];
  currentStage?: string;
  lastCompletedStage?: string;
  stoppedAtStage?: string;
  pendingCreditCount?: number;
}

/**
 * Tasks Service
 */
@Injectable({
  providedIn: 'root'
})
export class TasksService {
  private http = inject(HttpClient);

  private buildHttpParams(paramsData?: any): HttpParams {
    let httpParams = new HttpParams();
    if (paramsData) {
      const propNames = Object.getOwnPropertyNames(paramsData);
      for (let i = 0; i < propNames.length; i++) {
        const propName = propNames[i];
        if (!(paramsData[propName] === '' || paramsData[propName] === undefined || paramsData[propName] === null)) {
          httpParams = httpParams.set(propName, paramsData[propName]);
        }
      }
    }
    return httpParams;
  }

  /**
   * Get Maker Checker Data
   * @param {searchData} SearchData search the maker checker data.
   */
  getMakerCheckerData(searchData?: any): Observable<any> {
    return this.http
      .get('/makercheckers', { params: this.buildHttpParams(searchData) })
      .pipe(map((records: any[]) => (records || []).map(madeOnDateToMillis)));
  }

  /**
   * Get Credit Applications Data.
   * @param {any} searchData Credit applications search and paging parameters.
   */
  getCreditApplications(searchData?: any): Observable<any> {
    return this.http.get('/v2/credit-applications', { params: this.buildHttpParams(searchData) });
  }

  /**
   * Get enrollment status cases.
   * @param {EnrollmentCasesSearchParams} searchData Enrollment case search and paging parameters.
   */
  getEnrollmentCases(searchData: EnrollmentCasesSearchParams): Observable<EnrollmentCasesResponse> {
    return this.http.get<EnrollmentCasesResponse>('/v2/onboarding/cases', { params: this.buildHttpParams(searchData) });
  }

  /**
   * Get pending prospects.
   * @param {PendingProspectsSearchParams} searchData Pending prospects search, paging, and sorting parameters.
   */
  getPendingProspects(searchData?: PendingProspectsSearchParams): Observable<PendingProspectsResponse> {
    return this.http.get<PendingProspectsResponse>('/v2/prospects', { params: this.buildHttpParams(searchData) });
  }

  /**
   * Get Maker Checker Template
   */
  getMakerCheckerTemplate(): Observable<any> {
    return this.http.get('/makercheckers/searchtemplate');
  }

  /**
   * Get Grouped Clients Data
   */
  getGroupedClientsData(): Observable<any> {
    const httpParams = new HttpParams().set('limit', '1000').set('status', 'pending');
    return this.http.get('/clients', { params: httpParams });
  }

  /**
   * Get all Offices Data
   */
  getAllOffices(): Observable<any> {
    return this.http.get('/offices');
  }

  /**
   * Get all loans to be approved
   */
  getAllLoansToBeApproved(): Observable<any> {
    const httpParams = new HttpParams().set('limit', '1000').set('sqlSearch', 'l.loan_status_id in (100,200)');
    return this.http.get('/loans', { params: httpParams });
  }

  /**
   * Get all loans to be disbursed
   */
  getAllLoansToBeDisbursed(): Observable<any> {
    const httpParams = new HttpParams().set('limit', '1000').set('sqlSearch', 'l.loan_status_id in (200)');
    return this.http.get('/loans', { params: httpParams });
  }

  /**
   * Get all savings accounts to be approved
   */
  getAllSavingsToBeApproved(): Observable<any> {
    const httpParams = new HttpParams().set('limit', '1000').set('sqlSearch', 's.status_enum in (100,200)');
    return this.http.get('/savingsaccounts', { params: httpParams });
  }

  /**
   * Get Loans Locked Data using pages and limit
   */
  getAllLoansLocked(page: number, limit: number): Observable<any> {
    const httpParams = new HttpParams().set('page', page).set('limit', limit);
    return this.http.get('/loans/locked', { params: httpParams });
  }

  /**
   * Get Pending Rescheduled Loans
   */
  getPendingRescheduleLoans(): Observable<any> {
    const httpParams = new HttpParams().set('command', 'pending');
    return this.http.get('/rescheduleloans', { params: httpParams });
  }

  /**
   * Submit data in batches.
   * @param {data} Data to be submitted
   */
  submitBatchData(data: any): Observable<any> {
    return this.http.post('/batches', data);
  }

  /**
   * Execute Maker Checker Approve and Reject Action.
   * @param {makerCheckerId} MakerCheckerId
   * @param {command} Command
   */
  executeMakerCheckerAction(makerCheckerId: any, command: any): Observable<any> {
    const httpParams = new HttpParams().set('command', command);
    return this.http.post(`/makercheckers/${makerCheckerId}`, {}, { params: httpParams });
  }

  /**
   * Execute Maker Checker Delete Action
   * @param {makerCheckerId} MakerCheckerId
   */
  deleteMakerChecker(makerCheckerId: any): Observable<any> {
    return this.http.delete(`/makercheckers/${makerCheckerId}`);
  }

  /**
   * Get Maker Checker Details.
   * @param {makerCheckerId} MakerCheckerId
   */
  getCheckerInboxDetail(makerCheckerId: any): Observable<any> {
    return this.http.get(`/audits/${makerCheckerId}`).pipe(map(madeOnDateToMillis));
  }
}
