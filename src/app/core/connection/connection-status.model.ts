/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

/** Reachability of the Fineract server. */
export type ConnectionState = 'checking' | 'online' | 'offline';

/** Connection status shared by every view that shows it. */
export interface ConnectionStatus {
  state: ConnectionState;
  /** Time the last check completed, or null before the first one. */
  checkedAt: Date | null;
  /** Time the next check is due, or null while a check is running or the tab is hidden. */
  nextCheckAt: Date | null;
}
