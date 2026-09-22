/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

/** Lifecycle statuses the tenant management plugin recognises. */
export type TenantStatus = 'ACTIVE' | 'INACTIVE' | 'SUSPENDED';

/**
 * A tenant's read-write database connection.
 *
 * The password is deliberately absent: the plugin stores it encrypted and never returns it from any
 * endpoint, so the UI treats it as write-only throughout.
 */
export interface TenantConnection {
  id: number;
  schemaName: string;
  schemaServer: string;
  schemaServerPort: string;
  schemaUsername: string;
  schemaConnectionParameters?: string;
  autoUpdate: boolean;
}

export interface Tenant {
  id: number;
  identifier: string;
  name: string;
  timezoneId: string;
  /**
   * `null` when the stored value is not one the plugin recognises. Such a tenant is refused with
   * 503 until its status is set again, so it is shown as unrecognised rather than as a status.
   */
  status: TenantStatus | null;
  description?: string;
  contactEmail?: string;
  /** Year, month, day. */
  joinedDate?: number[];
  createdDate?: string;
  lastModifiedDate?: string;
  connection: TenantConnection;
}

export interface TenantsPage {
  pageItems: Tenant[];
  totalFilteredRecords: number;
}

/** Selectable values the backend owns, so the UI never hardcodes either list. */
export interface TenantTemplate {
  timezones: string[];
  statuses: string[];
}

export interface TenantsQuery {
  /** Matches identifier and name, literally and case-insensitively. */
  search?: string;
  status?: string;
  offset?: number;
  limit?: number;
}

/**
 * Where the master credential lives while a tab is signed in.
 *
 * `sessionStorage` only: this credential administers every tenant on the installation, so it is
 * never persisted across browser sessions and there is no "remember me" for it. The keys are
 * exported because `AuthenticationService` clears them on logout — a web-app logout must not leave
 * a higher-privilege session behind in the tab.
 */
export const TENANT_MASTER_CREDENTIALS_KEY = 'mifosXTenantMasterCredentials';
export const TENANT_MASTER_USERNAME_KEY = 'mifosXTenantMasterUsername';
