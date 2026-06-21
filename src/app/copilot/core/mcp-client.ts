/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { McpStreamEvent } from './models/mcp-response.model';

/** Transport-level options for the MCP connection. */
export interface McpClientOptions {
  baseUrl: string;
  /** Per-request timeout in ms (proposal: 15s). */
  timeoutMs: number;
  /** Max retry attempts with exponential backoff (proposal: 3). */
  maxRetries: number;
}

/**
 * Low-level, framework-agnostic MCP transport: opens the SSE stream and
 * yields parsed events. Has no Angular dependency so it can be unit-tested
 * against a mock EventSource. The DI wrapper lives in services/mcp-client.service.ts.
 */
export class McpClient {
  constructor(private readonly options: McpClientOptions) {}

  /**
   * Open an SSE stream for a chat turn. Callers subscribe to receive
   * token / tool_call / action_card / done / error events.
   */
  stream(_payload: { message: string; context: unknown; idempotencyKey?: string }): AsyncIterable<McpStreamEvent> {
    // TODO: open EventSource, apply timeout + backoff, yield events.
    throw new Error('Not implemented');
  }
}
