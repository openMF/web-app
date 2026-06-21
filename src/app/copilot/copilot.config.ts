/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { InjectionToken } from '@angular/core';
import { environment } from '../../environments/environment';

/** Runtime configuration for the Copilot feature. */
export interface CopilotConfig {
  /** Base URL of the MCP server, e.g. https://ai.mifos.community. */
  mcpBaseUrl: string;
  /** Per-request timeout in ms. */
  requestTimeoutMs: number;
  /** Max retry attempts (exponential backoff). */
  maxRetries: number;
  /** Max characters accepted from the user per message. */
  maxInputLength: number;
  /** Permission required to see the panel. */
  requiredPermission: string;
}

export const DEFAULT_COPILOT_CONFIG: CopilotConfig = {
  mcpBaseUrl: environment.copilotMcpBaseUrl,
  requestTimeoutMs: 15_000,
  maxRetries: 3,
  maxInputLength: 500,
  requiredPermission: 'READ_COPILOT'
};

/** DI token so the host app can override config at bootstrap. */
export const COPILOT_CONFIG = new InjectionToken<CopilotConfig>('COPILOT_CONFIG', {
  providedIn: 'root',
  factory: () => DEFAULT_COPILOT_CONFIG
});
