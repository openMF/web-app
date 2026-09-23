/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

/** Custom Models */
import { TestConnectionResponse } from './models/tenant.model';

/** How a verdict should read: an outcome to act on, or a healthy state to confirm. */
export type ConnectionVerdictTone = 'success' | 'error';

export interface ConnectionVerdict {
  /** Translation key describing what the probe found. */
  key: string;
  tone: ConnectionVerdictTone;
}

/**
 * Turns a probe into something worth showing.
 *
 * The same four fields mean different things on the two forms, which is why this takes
 * `expectExisting` rather than being read straight from the response. A database that is not there
 * yet is the ordinary state while creating a tenant and an outright problem while editing one, and
 * saying "not found" in the first case would report a healthy answer as a failure.
 *
 * Kept as a plain function so both forms share one reading of the response, and so the readings can
 * be tested without rendering anything.
 */
export function connectionProbeVerdict(probe: TestConnectionResponse, expectExisting: boolean): ConnectionVerdict {
  if (!probe.serverReachable) {
    return { key: 'labels.text.Database server did not answer', tone: 'error' };
  }
  if (!probe.credentialsAccepted) {
    return { key: 'labels.text.Database server refused the credentials', tone: 'error' };
  }
  if (probe.schemaPresent) {
    return {
      key: expectExisting ? 'labels.text.Tenant database answered' : 'labels.text.Existing database will be reused',
      tone: 'success'
    };
  }
  // Credentials good, database absent.
  return expectExisting
    ? { key: 'labels.text.Tenant database is missing', tone: 'error' }
    : { key: 'labels.text.Database will be created on submit', tone: 'success' };
}
