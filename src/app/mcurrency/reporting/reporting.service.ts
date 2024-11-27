import { Injectable } from '@angular/core';
import { HttpClient, HttpParams, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface ReportEntry {
  date: Date;
  creditAccount: string;
  debitAccount: string;
  description: string;
  debitUSD: number;
  creditUSD: number;
  conversionRate: number;
  debitUGX: number;
  creditUGX: number;
}

@Injectable({
  providedIn: 'root'
})
export class ReportingService {
  // Adjust this to your Fineract base URL
  private apiUrl = '/fineract-provider/api/v1';

  constructor(
    private http: HttpClient,
    private authenticationService: AuthenticationService
  ) { }

  /**
   * Fetch multi-currency transactions from Fineract
   * @param params Search and pagination parameters
   * @returns Observable of report entries
   */
  getMultiCurrencyReport(params: {
    startDate?: string;
    endDate?: string;
    accountId?: number;
    page?: number;
    pageSize?: number;
  }): Observable<{
    data: ReportEntry[];
    totalCount: number;
  }> {
    // Get authentication credentials
    const credentials = this.authenticationService.getCredentials();

    // Prepare HTTP headers
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Basic ${btoa(`${credentials.username}:${credentials.password}`)}`
    });

    // Prepare query parameters
    let httpParams = new HttpParams();

    if (params.startDate) {
      httpParams = httpParams.set('startDate', params.startDate);
    }
    if (params.endDate) {
      httpParams = httpParams.set('endDate', params.endDate);
    }
    if (params.accountId) {
      httpParams = httpParams.set('accountId', params.accountId.toString());
    }

    // Pagination
    httpParams = httpParams.set('offset', ((params.page || 0) * (params.pageSize || 10)).toString());
    httpParams = httpParams.set('limit', (params.pageSize || 10).toString());

    // Make the API call to Fineract
    return this.http.get<any>(`${this.apiUrl}/journalentries`, {
      headers: headers,
      params: httpParams
    }).pipe(
      map(response => ({
        data: response.pageItems.map((entry: any) => ({
          date: new Date(entry.transactionDate),
          creditAccount: entry.creditAccount?.name || 'N/A',
          debitAccount: entry.debitAccount?.name || 'N/A',
          description: entry.comments || 'No description',
          debitUSD: parseFloat(entry.amount || '0'),
          creditUSD: parseFloat(entry.amount || '0'),
          conversionRate: 1, // You might need to implement actual conversion rate logic
          debitUGX: parseFloat(entry.amount || '0') * 3660, // Example conversion rate
          creditUGX: parseFloat(entry.amount || '0') * 3660
        })),
        totalCount: response.totalFilteredRecords || 0
      }))
    );
  }
}
