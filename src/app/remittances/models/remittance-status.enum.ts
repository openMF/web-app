/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

export enum RemittanceStatus {
  PENDING = 'PENDING',
  READY_FOR_PAYOUT = 'READY_FOR_PAYOUT',
  PAID = 'PAID',
  REJECTED = 'REJECTED',
  CANCELED = 'CANCELED',
  EXPIRED = 'EXPIRED',
  UNKNOWN = 'UNKNOWN'
}

/**
 * Determines whether the given status represents a terminal (final) state.
 */
export function isTerminalStatus(status: RemittanceStatus): boolean {
  return [
    RemittanceStatus.PAID,
    RemittanceStatus.REJECTED,
    RemittanceStatus.CANCELED,
    RemittanceStatus.EXPIRED
  ].includes(status);
}

/**
 * Maps a raw status string from the API to the RemittanceStatus enum.
 * Handles both CANCELED (US) and CANCELLED (UK) spellings.
 */
export function parseRemittanceStatus(raw: string): RemittanceStatus {
  if (!raw) return RemittanceStatus.UNKNOWN;
  let normalized = raw.toUpperCase().replace(/-/g, '_').trim();
  if (normalized === 'CANCELLED') {
    normalized = 'CANCELED';
  }
  const match = Object.values(RemittanceStatus).find((s) => s === normalized);
  return match ?? RemittanceStatus.UNKNOWN;
}
