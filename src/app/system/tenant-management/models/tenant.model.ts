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

/** The commands the status endpoint accepts. */
export type TenantStatusCommand = 'activate' | 'deactivate' | 'suspend';

/**
 * What the backend accepts for an identifier.
 *
 * Narrow on purpose: the identifier travels in the `Fineract-Platform-TenantId` header and is
 * compared on every request. Mirrored here so the form rejects a bad value before a round trip.
 */
export const TENANT_IDENTIFIER_PATTERN = /^[a-z0-9][a-z0-9_-]{0,99}$/;

/**
 * What the backend accepts for a schema name.
 *
 * It is concatenated into `CREATE DATABASE` DDL, which no JDBC driver allows to be bound as a
 * parameter, so the pattern is what makes it safe. It must start with a letter or underscore
 * because PostgreSQL rejects an unquoted database name starting with a digit, and 63 characters is
 * PostgreSQL's identifier limit.
 */
export const TENANT_SCHEMA_NAME_PATTERN = /^[A-Za-z_][A-Za-z0-9_]{0,62}$/;

/** Lowest and highest TCP port the backend accepts. */
export const TENANT_PORT_MIN = 1;
export const TENANT_PORT_MAX = 65535;

export interface CreateTenantPayload {
  identifier: string;
  name: string;
  timezoneId: string;
  description?: string;
  contactEmail?: string;
  schemaName: string;
  schemaServer: string;
  /** Sent as a string, not a number, which is what the backend declares. */
  schemaServerPort: string;
  schemaUsername: string;
  /** Write-only: stored encrypted and never returned. */
  schemaPassword: string;
  schemaConnectionParameters?: string;
  autoUpdate?: boolean;
  status?: string;
}

/**
 * A partial update. Omitting a field leaves it unchanged.
 *
 * `identifier` is absent deliberately: it cannot be changed, and sending one is rejected rather
 * than ignored. An empty string clears `description`, `contactEmail` and
 * `schemaConnectionParameters`; for the other fields blank is refused.
 */
export interface UpdateTenantPayload {
  name?: string;
  timezoneId?: string;
  description?: string;
  contactEmail?: string;
  schemaServer?: string;
  schemaServerPort?: string;
  schemaUsername?: string;
  /** Omit to keep the stored password. */
  schemaPassword?: string;
  schemaConnectionParameters?: string;
  autoUpdate?: boolean;
}

export interface TestConnectionPayload {
  schemaName: string;
  schemaServer: string;
  schemaServerPort: string;
  schemaUsername: string;
  /** Used for this probe only; never stored. */
  schemaPassword: string;
  schemaConnectionParameters?: string;
}

/**
 * What the backend found when it probed.
 *
 * `reachable` describes the target database itself. It cannot be acted on before a tenant exists,
 * because the database has usually not been created yet — the three fields beside it separate the
 * states that answer alone cannot, which is what MX-421 added them for. The driver's own message is
 * still withheld, since those routinely echo the connection string and user back; what comes back
 * is a classification, not the text.
 */
export interface TestConnectionResponse {
  /** The target database itself answered. */
  reachable: boolean;
  /** The database server answered at all. */
  serverReachable: boolean;
  /** The server accepted the username and password. */
  credentialsAccepted: boolean;
  /** The server already holds a database of that name, which creation reuses rather than empties. */
  schemaPresent: boolean;
}

export interface DeleteTenantResponse {
  resourceId: number;
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
