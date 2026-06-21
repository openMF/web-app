/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

/** Angular Imports */
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

/** Models */
import { McpStreamEvent } from '../core/models/mcp-response.model';
import { CopilotContext } from '../core/models/copilot-context.model';

/**
 * DI wrapper around the framework-agnostic core McpClient.
 * Adapts the async stream into an RxJS Observable for the UI and
 * handles tool-call branching (read = execute, write = confirm).
 */
@Injectable({ providedIn: 'root' })
export class McpClientService {
  /** Stream a chat turn as Observable events. Timeout: 15s, retry: backoff x3. */
  sendMessage(_message: string, _context: CopilotContext, _idempotencyKey?: string): Observable<McpStreamEvent> {
    // TODO: wrap core McpClient.stream() in an Observable.
    throw new Error('Not implemented');
  }

  /** Decide whether a tool call executes immediately or needs confirmation. */
  handleToolCall(_event: McpStreamEvent): void {
    // TODO: route write tools to a confirmation dialog.
    throw new Error('Not implemented');
  }
}
