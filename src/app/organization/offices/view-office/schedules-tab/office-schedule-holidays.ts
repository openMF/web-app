/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import moment from 'moment';
import { _ as extract } from '@ngx-translate/core';

export interface OfficeHoliday {
  id: number;
  name: string;
  fromDate: Date;
  toDate: Date;
  statusKey: string;
  pending: boolean;
}

/** Fineract LocalDate conventions; reject invalid dates instead of rolling them into another month. */
function holidayDate(value: unknown): moment.Moment {
  if (Array.isArray(value) && value.length === 3 && value.every(Number.isInteger)) {
    return moment(value.join('-'), 'YYYY-M-D', true);
  }
  if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return moment(value, 'YYYY-MM-DD', true);
  }
  return moment.invalid();
}

/** The window uses the viewer's calendar, never an inferred office timezone or financial business date. */
export function upcomingOfficeHolidays(records: unknown, now: Date): OfficeHoliday[] {
  if (!Array.isArray(records)) throw new TypeError('Invalid holiday collection');
  const today = moment(now).startOf('day');
  const end = today.clone().add(60, 'days');
  const seen = new Set<number>();
  const holidays: OfficeHoliday[] = [];
  for (const record of records) {
    // Fineract HolidayStatusType: 0 invalid, 100 pending, 300 active, 600 deleted.
    if (record?.status?.id === 600 || record?.status?.id === 0) continue;
    const from = holidayDate(record?.fromDate);
    const to = holidayDate(record?.toDate);
    if (
      !Number.isSafeInteger(record?.id) ||
      record.id <= 0 ||
      typeof record.name !== 'string' ||
      !record.name.trim() ||
      ![
        100,
        300
      ].includes(record?.status?.id) ||
      !from.isValid() ||
      !to.isValid() ||
      to.isBefore(from)
    ) {
      throw new TypeError('Invalid holiday record');
    }
    if (seen.has(record.id) || to.isBefore(today) || !from.isBefore(end)) continue;
    seen.add(record.id);
    holidays.push({
      id: record.id,
      name: record.name,
      fromDate: from.toDate(),
      toDate: to.toDate(),
      pending: record.status.id === 100,
      statusKey:
        record.status.id === 300 ? extract('labels.status.Active') : extract('labels.officeHours.pendingHoliday')
    });
  }
  return holidays.sort((a, b) => a.fromDate.getTime() - b.fromDate.getTime() || a.id - b.id);
}
