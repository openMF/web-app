/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import type { ComponentVersion, SystemInformation } from './system-info.service';

/** Shown in place of any missing value, so a cell or item is never left empty. */
export const MISSING_VALUE = '—';

/** Number of characters of a commit hash shown in the version chips. */
export const SHORT_HASH_LENGTH = 7;

/**
 * Pre-release markers. They only count as their own part of a version (after a separator or a
 * digit, optionally followed by a number), so a word that merely contains `rc` is not flagged.
 */
const PRE_RELEASE_PATTERN = /(?:^|[-.+_]|(?<=\d))(?:snapshot|rc|alpha|beta)(?=$|[-.+_\d])/i;

/** Older Fineract builds append the commit to the version instead of reporting it separately. */
const VERSION_WITH_HASH_PATTERN = /^(\d+(?:\.\d+)*)-([0-9a-f]{7,40})$/i;

/** git-describe prefixes the abbreviated hash with `g`, e.g. `g5ff9f8385`. */
const GIT_DESCRIBE_HASH_PREFIX = /^g(?=[0-9a-f]+$)/i;

/**
 * Returns the value to display, or {@link MISSING_VALUE} when it is missing or blank.
 *
 * @param {string | null | undefined} value Value to display.
 * @returns {string} The trimmed value, or {@link MISSING_VALUE}.
 */
export function orDash(value: string | null | undefined): string {
  const text = value?.trim();
  return text ? text : MISSING_VALUE;
}

/**
 * Tells whether a version is a pre-release build (`SNAPSHOT`, `RC`, `alpha` or `beta`, in any case).
 *
 * @param {string | null | undefined} version Version as reported, e.g. `1.17.0-SNAPSHOT`.
 * @returns {boolean} True for a pre-release build.
 */
export function isPreRelease(version: string | null | undefined): boolean {
  return !!version && PRE_RELEASE_PATTERN.test(version);
}

/**
 * Splits a reported version into its number and its pre-release marker.
 *
 * @param {string} raw Version as reported, e.g. `1.17.0-SNAPSHOT`.
 * @returns {{ version: string; preRelease: string }} e.g. `1.17.0` and `SNAPSHOT`; the marker is empty for a release.
 */
export function splitPreRelease(raw: string): { version: string; preRelease: string } {
  const marker = PRE_RELEASE_PATTERN.exec(raw);
  if (!marker) {
    return { version: raw, preRelease: '' };
  }
  return {
    version: raw.slice(0, marker.index).replace(/[-.+_]$/, ''),
    preRelease: raw.slice(marker.index).replace(/^[-.+_]/, '')
  };
}

/**
 * Parses the Fineract version and commit from the actuator info endpoint.
 *
 * @param {any} info Response of `/actuator/info`, or null when it could not be read.
 * @returns {ComponentVersion} The parsed version; every field is empty when the response has none.
 */
export function parseFineractVersion(info: any): ComponentVersion {
  const raw = `${info?.git?.build?.version ?? ''}`.trim();
  // Spring Boot reports the commit id as a string in its simple mode and as an object in its full mode.
  const commitId = info?.git?.commit?.id;
  const hash: string = (typeof commitId === 'string' ? commitId : commitId?.abbrev) || '';
  const fullHash: string = (typeof commitId === 'string' ? commitId : commitId?.full) || '';

  const legacy = hash || fullHash ? null : VERSION_WITH_HASH_PATTERN.exec(raw);
  if (legacy) {
    return toComponentVersion(raw, legacy[1], '', legacy[2], legacy[2]);
  }
  const { version, preRelease } = splitPreRelease(raw);
  return toComponentVersion(raw, version, preRelease, hash, fullHash);
}

/**
 * Builds the web app version from the values `version.js` writes at build time.
 *
 * @param {string} version Build number, e.g. `261110`.
 * @param {string} hash Abbreviated commit hash as reported by git-describe, e.g. `g5ff9f8385`.
 * @param {string} fullHash Full commit hash, when the build recorded it.
 * @returns {ComponentVersion} The parsed version.
 */
export function parseWebAppVersion(version: string, hash: string, fullHash?: string): ComponentVersion {
  const raw = `${version ?? ''}`.trim();
  const abbreviated = `${hash ?? ''}`.trim().replace(GIT_DESCRIBE_HASH_PREFIX, '');
  const split = splitPreRelease(raw);
  return toComponentVersion(raw, split.version, split.preRelease, abbreviated, fullHash?.trim() || '');
}

function toComponentVersion(
  raw: string,
  version: string,
  preRelease: string,
  hash: string,
  fullHash: string
): ComponentVersion {
  return {
    raw,
    version,
    preRelease,
    hash: (hash || fullHash).slice(0, SHORT_HASH_LENGTH),
    fullHash: fullHash || hash
  };
}

/** Connection status as written in the diagnostics text. */
export interface DiagnosticsStatus {
  /** Status in English, e.g. `Connected`. */
  text: string;
  /** Time of the last completed check, or null before the first one. */
  checkedAt: Date | null;
}

/**
 * Formats the plain text copied by "Copy diagnostics" for a support ticket. The labels stay in
 * English whatever the user's language, so support can read every report.
 *
 * @param {SystemInformation} info Backend and environment information.
 * @param {DiagnosticsStatus} status Current connection status.
 * @param {string} userAgent Browser user agent.
 * @returns {string} One `Label: value` line per item.
 */
export function formatDiagnostics(info: SystemInformation, status: DiagnosticsStatus, userAgent: string): string {
  const checked = status.checkedAt ? ` (checked ${formatTimestamp(status.checkedAt)})` : '';
  const rendered = info.renderTime
    ? `${formatTimestamp(info.renderTime)} (${formatUtcOffset(info.renderTime)})`
    : MISSING_VALUE;
  return [
    `Mifos X WebApp: ${versionWithHash(info.webApp)}`,
    `Apache Fineract: ${versionWithHash(info.fineract)}`,
    `Server: ${orDash(info.server)}`,
    `Tenant: ${orDash(info.tenant)}`,
    `Username: ${orDash(info.username)}`,
    `Name: ${orDash(info.name)}`,
    `Status: ${orDash(status.text)}${checked}`,
    `Rendered: ${rendered}`,
    `User agent: ${orDash(userAgent)}`
  ].join('\n');
}

/**
 * Formats a date as `yyyy-MM-dd HH:mm:ss` in the browser's time zone.
 *
 * @param {Date} date Date to format.
 * @returns {string} e.g. `2026-11-10 23:38:27`.
 */
export function formatTimestamp(date: Date): string {
  return (
    `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ` +
    `${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`
  );
}

/**
 * Formats the browser's UTC offset at the given date.
 *
 * @param {Date} date Date the offset applies to, so daylight saving time is taken into account.
 * @returns {string} e.g. `UTC-06:00`.
 */
export function formatUtcOffset(date: Date): string {
  const offset = -date.getTimezoneOffset();
  const minutes = Math.abs(offset);
  return `UTC${offset < 0 ? '-' : '+'}${pad(Math.floor(minutes / 60))}:${pad(minutes % 60)}`;
}

function versionWithHash(component: ComponentVersion | null | undefined): string {
  const version = orDash(component?.raw);
  return component?.hash ? `${version} (${component.hash})` : version;
}

function pad(value: number): string {
  return `${value}`.padStart(2, '0');
}
