/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { HttpErrorResponse } from '@angular/common/http';

/** A timeout can occur after the backend has already committed the record. */
export function anpaSaveRejected(error: HttpErrorResponse): boolean {
  return error.status >= 400 && error.status < 500 && error.status !== 408;
}

/** Never surface backend stack traces or raw server messages. */
export function anpaErrorKey(error: HttpErrorResponse, mutation = false): string {
  if (mutation && !anpaSaveRejected(error)) {
    return 'labels.anpa.errors.uncertain';
  }
  const keys: Record<number, string> = {
    0: 'offline',
    400: 'invalid',
    401: 'unauthenticated',
    403: 'forbidden',
    404: 'missing',
    409: 'conflict',
    422: 'invalid',
    500: 'server',
    502: 'offline',
    503: 'offline'
  };
  return `labels.anpa.errors.${keys[error.status] ?? 'server'}`;
}
