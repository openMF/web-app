import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface ReportEntry {
  date: string;
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
  private apiUrl = 'http://localhost:8080'; // Adjust this to match your backend URL

  constructor(private http: HttpClient) { }

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
    if (params.page !== undefined) {
      httpParams = httpParams.set('page', params.page.toString());
    }
    if (params.pageSize !== undefined) {
      httpParams = httpParams.set('pageSize', params.pageSize.toString());
    }

    return this.http.get<any>(`${this.apiUrl}/multi-currency`, { params: httpParams })
      .pipe(
        map(response => ({
          data: response.data.map((entry: any) => ({
            ...entry,
            debitUSD: parseFloat(entry.debitUSD),
            creditUSD: parseFloat(entry.creditUSD),
            conversionRate: parseFloat(entry.conversionRate),
            debitUGX: parseFloat(entry.debitUGX),
            creditUGX: parseFloat(entry.creditUGX)
          })),
          totalCount: response.totalCount
        }))
      );
  }
}
