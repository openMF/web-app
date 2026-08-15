/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { InjectionToken } from '@angular/core';
import { environment } from '../../environments/environment';

/** Runtime configuration for the Copilot feature (wire contract v1, ADR-001). */
export interface CopilotConfig {
  /**
   * Base URL of the Copilot gateway, e.g. https://gateway.example.com.
   * The literal value 'mock' (or empty) serves fixture responses so the UI
   * works before a gateway is deployed.
   */
  mcpBaseUrl: string;
  /**
   * Time allowed until the FIRST streamed chunk arrives. LLM turns with tool
   * calls routinely take tens of seconds before the first token, so this is
   * deliberately long. Chat POSTs are never auto-retried — an LLM turn is not
   * idempotent; retry is a visible user action (ADR-001 §03).
   */
  firstTokenTimeoutMs: number;
  /** Max characters accepted from the user per message. */
  maxInputLength: number;
  /** Permissions (any of) that allow seeing the panel. */
  allowedPermissions: string[];
}

export const DEFAULT_COPILOT_CONFIG: CopilotConfig = {
  mcpBaseUrl: environment.copilotMcpBaseUrl,
  firstTokenTimeoutMs: 60_000,
  maxInputLength: 500,
  allowedPermissions: [
    'ALL_FUNCTIONS',
    'USE_MCP_TOOLS',
    'READ_COPILOT'
  ]
};

/** DI token so the host app can override config at bootstrap. */
export const COPILOT_CONFIG = new InjectionToken<CopilotConfig>('COPILOT_CONFIG', {
  providedIn: 'root',
  factory: () => DEFAULT_COPILOT_CONFIG
});
