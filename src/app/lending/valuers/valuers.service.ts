/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';
import { BsCalendarService } from 'app/core/bs-calendar/bs-calendar.service';

/** A valuer as the backend answers it (fields left out of the answer are null here). */
export interface Valuer {
  id: number;
  name: string;
  registered: boolean;
  registrationNo: string | null;
  /** The Bikram Sambat year the fiscal year starts in, e.g. 2083 for 2083/84. */
  fiscalYear: number | null;
  phone: string | null;
  address: string | null;
  active: boolean;
  listedThisYear: boolean;
}

/** What is sent to add or change a valuer. */
export interface ValuerInput {
  name: string;
  registered: boolean;
  registrationNo: string | null;
  fiscalYear: number | null;
  phone: string | null;
  address: string | null;
  active: boolean;
}

/** Shrawan, the month the Nepali fiscal year starts in. */
const FISCAL_YEAR_START_MONTH = 4;

/** "2083/84" for 2083. */
export function fiscalYearLabel(year: number | null | undefined): string {
  return year == null ? '' : `${year}/${String((year + 1) % 100).padStart(2, '0')}`;
}

/** The valuers who value land and houses for loans (fineract-dbug docs/lending.md, "Valuers"). */
@Injectable({ providedIn: 'root' })
export class ValuersService {
  private http = inject(HttpClient);
  private bsCalendar = inject(BsCalendarService);

  /** The valuers in use; with `all`, the ones no longer used too. */
  list(all = false): Observable<Valuer[]> {
    const params = all ? new HttpParams().set('all', 'true') : undefined;
    return this.http
      .get<Partial<Valuer>[]>('/nepal/lending/valuers', { params })
      .pipe(map((rows) => (rows ?? []).map(withNulls)));
  }

  add(valuer: ValuerInput): Observable<Valuer> {
    return this.http.post<Partial<Valuer>>('/nepal/lending/valuers', valuer).pipe(map(withNulls));
  }

  update(id: number, valuer: ValuerInput): Observable<Valuer> {
    return this.http.put<Partial<Valuer>>(`/nepal/lending/valuers/${id}`, valuer).pipe(map(withNulls));
  }

  /** The fiscal year today falls in, as the BS year it starts in (it starts on 1 Shrawan). */
  currentFiscalYear(): number | null {
    const today = this.bsCalendar.todayBs();
    if (!today) {
      return null;
    }
    return today.month >= FISCAL_YEAR_START_MONTH ? today.year : today.year - 1;
  }
}

/** The backend leaves null fields out of its answer: read a missing field as null. */
function withNulls(v: Partial<Valuer>): Valuer {
  return {
    id: v.id,
    name: v.name ?? null,
    registered: v.registered ?? false,
    registrationNo: v.registrationNo ?? null,
    fiscalYear: v.fiscalYear ?? null,
    phone: v.phone ?? null,
    address: v.address ?? null,
    active: v.active ?? false,
    listedThisYear: v.listedThisYear ?? false
  };
}
