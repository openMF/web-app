/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { ConnectionState, ConnectionStatus } from 'app/core/connection/connection-status.model';
import { ComponentVersion, SystemInformation } from 'app/system/system-info.service';

/** Everything the status bar and its System information panel render. */
export interface StatusBarView {
  status: ConnectionStatus;
  info: SystemInformation;
  /** Server host without its protocol, e.g. `apis.mifos.community`. */
  host: string;
  /** Fineract version, or null while the server is unreachable since it comes from the server. */
  fineract: ComponentVersion | null;
  /** Seconds until the next check while the server is unreachable, otherwise null. */
  retryIn: number | null;
  /** True on small screens, where the compact bar replaces the full one. */
  compact: boolean;
}

/** Translation key of the status text for each connection state. */
export const STATUS_TEXT_KEYS: Record<ConnectionState, string> = {
  online: 'labels.text.Connected',
  offline: 'labels.text.Server unreachable',
  checking: 'labels.text.Checking connection'
};

/** Status text for each connection state in the diagnostics, which stay in English for support. */
export const DIAGNOSTICS_STATUS_TEXT: Record<ConnectionState, string> = {
  online: 'Connected',
  offline: 'Server unreachable',
  checking: 'Checking connection'
};
