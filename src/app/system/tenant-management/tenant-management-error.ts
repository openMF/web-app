/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

/** Angular Imports */
import { HttpErrorResponse } from '@angular/common/http';

/**
 * Pulls the message Fineract sent out of an error response, or `null` when it sent none.
 *
 * The tenant management API is called on a client with no interceptors, so
 * `ErrorHandlerInterceptor` never sees these failures and the feature reads the body itself. That
 * is deliberate rather than a gap: a 401 on the master credential is not the web-app session
 * expiring, and must not raise the global "Authentication Error" alert that says it is.
 */
export function tenantManagementErrorMessage(error: HttpErrorResponse): string | null {
  const body = error?.error;
  if (!body || typeof body !== 'object') {
    return null;
  }
  const nested = Array.isArray(body.errors) ? body.errors[0] : null;
  return (
    nested?.defaultUserMessage || nested?.developerMessage || body.defaultUserMessage || body.developerMessage || null
  );
}

/**
 * The translation key describing a failed tenant management request, by status.
 *
 * 404 is called out because it is the expected answer from a server running stock Fineract: the
 * tenant management plugin is not installed, and saying so is more use than "resource not found".
 */
export function tenantManagementErrorKey(status: number): string {
  switch (status) {
    case 401:
      return 'errors.tenantManagement.unauthorized';
    case 404:
      return 'errors.tenantManagement.notAvailable';
    default:
      return 'errors.tenantManagement.unknown';
  }
}
