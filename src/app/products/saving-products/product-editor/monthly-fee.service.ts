/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { map } from 'rxjs';
import { SettingsService } from 'app/settings/settings.service';
import { environment } from 'environments/environment';
import {
  parseMonthlyFeeJson,
  readFeeCapabilities,
  readFeeHistory,
  readFeePage,
  readFeeReconciliation,
  readFeeRun,
  validFeePeriod
} from './monthly-fee.model';

@Injectable({ providedIn: 'root' })
export class MonthlyFeeService {
  private http = inject(HttpClient);
  private settings = inject(SettingsService);
  private tenant() {
    return this.settings.tenantIdentifier || environment.fineractPlatformTenantId;
  }
  private scopedRun = (value: unknown) => {
    const run = readFeeRun(value);
    if (run.tenant !== this.tenant()) throw new Error('Diagnostic tenant mismatch');
    return run;
  };
  // ApiPrefixInterceptor prepends /fineract-provider/api/v1 exactly once.
  private root = '/savings/monthly-fees';
  private get(path: string, params = new HttpParams()) {
    const tenant = this.tenant();
    return this.http.get(this.root + path, { params, responseType: 'text' }).pipe(
      map((text) => {
        if (tenant !== this.tenant()) throw new Error('Diagnostic tenant changed');
        return parseMonthlyFeeJson(text);
      })
    );
  }
  private runPath(id: string) {
    if (!id || !/^[a-zA-Z0-9-]{1,100}$/.test(id)) throw new Error('Invalid diagnostic run ID');
    return '/runs/' + encodeURIComponent(id);
  }
  private size(limit: number) {
    if (!Number.isInteger(limit) || limit < 1 || limit > 100) throw new Error('Invalid diagnostic limit');
    return new HttpParams().set('limit', limit);
  }
  capabilities() {
    return this.get('/template').pipe(map(readFeeCapabilities));
  }
  runs(beforePeriod?: string | null, limit = 20) {
    let params = this.size(limit);
    if (beforePeriod) {
      if (!validFeePeriod(beforePeriod)) throw new Error('Invalid history cursor');
      params = params.set('beforePeriod', beforePeriod);
    }
    return this.get('/runs', params).pipe(
      map((value) => {
        const history = readFeeHistory(value);
        history.items.forEach(this.scopedRun);
        return history;
      })
    );
  }
  run(id: string) {
    return this.get(this.runPath(id)).pipe(map(this.scopedRun));
  }
  createDiagnosticRun(period: string) {
    if (!validFeePeriod(period)) throw new Error('Invalid diagnostic period');
    return this.http
      .post(this.root + '/runs', null, { params: new HttpParams().set('period', period), responseType: 'text' })
      .pipe(map(parseMonthlyFeeJson), map(this.scopedRun));
  }
  assessDiagnosticChunk(id: string, limit: number) {
    return this.http
      .post(this.root + this.runPath(id) + '/assess', null, { params: this.size(limit), responseType: 'text' })
      .pipe(map(parseMonthlyFeeJson), map(this.scopedRun));
  }
  assessments(id: string, afterId = '0', limit = 20) {
    if (!/^(?:0|[1-9]\d*)$/.test(afterId) || BigInt(afterId) > 9223372036854775807n)
      throw new Error('Invalid assessment cursor');
    return this.get(this.runPath(id) + '/assessments', this.size(limit).set('afterId', afterId)).pipe(map(readFeePage));
  }
  reconciliation(id: string) {
    return this.get(this.runPath(id) + '/reconciliation').pipe(map(readFeeReconciliation));
  }
}
