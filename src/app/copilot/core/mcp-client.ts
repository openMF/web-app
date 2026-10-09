/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import {
  McpChatRequest,
  McpDecisionRequest,
  McpErrorCode,
  McpStreamEvent,
  McpStreamEventType,
  PendingAction,
  CardRow
} from './models/mcp-response.model';
import { ActionCard } from './models/action-card.model';

/** Transport-level options for the Copilot gateway connection. */
export interface McpClientOptions {
  /** Gateway origin, e.g. https://gateway.example.com (no trailing slash needed). */
  baseUrl: string;
  /**
   * Time allowed until the FIRST chunk arrives. LLM turns routinely take tens
   * of seconds before the first token, so this is deliberately long (ADR-001).
   */
  firstTokenTimeoutMs: number;
  /** Injectable for unit tests; defaults to the global fetch. */
  fetchFn?: typeof fetch;
}

const CHAT_PATH = '/copilot/api/v1/chat';
/** Card ids are gateway-minted plain tokens; anything else is refused (path-injection guard). */
const CARD_ID_PATTERN = /^[A-Za-z0-9_-]+$/;

const VALID_EVENT_TYPES: ReadonlyArray<McpStreamEventType> = [
  'token',
  'thinking',
  'tool_call',
  'action_card',
  'suggest',
  'done',
  'error'
];

/**
 * Low-level, framework-agnostic transport for wire contract v1: POSTs a JSON
 * body and consumes the SSE response via fetch + ReadableStream. Native
 * EventSource is unusable here: it can neither POST a body nor set the
 * Authorization/tenant headers this contract requires.
 *
 * Retry policy (ADR-001): a chat turn is NOT idempotent, so this client never
 * retries automatically. Cancel/retry is a visible user action.
 *
 * No Angular dependency, see mcp-client.spec.ts. The DI wrapper lives in
 * services/mcp-client.service.ts.
 */
export class McpClient {
  constructor(private readonly options: McpClientOptions) {}

  /** Stream a chat turn. */
  chat(request: McpChatRequest, headers: Record<string, string>, signal?: AbortSignal): AsyncIterable<McpStreamEvent> {
    return this.stream(CHAT_PATH, request, headers, signal);
  }

  /** Approve/reject a pending action; the response continues the paused turn. */
  decision(
    cardId: string,
    request: McpDecisionRequest,
    headers: Record<string, string>,
    signal?: AbortSignal
  ): AsyncIterable<McpStreamEvent> {
    if (!CARD_ID_PATTERN.test(cardId)) {
      // Dot-segments etc. survive encodeURIComponent, so refuse anything but plain ids.
      return this.singleErrorStream('INTERNAL', 'Invalid confirmation reference.', false);
    }
    const path = `/copilot/api/v1/actions/${encodeURIComponent(cardId)}/decision`;
    return this.stream(path, request, headers, signal);
  }

  private async *singleErrorStream(
    code: McpErrorCode,
    message: string | undefined,
    retryable: boolean
  ): AsyncGenerator<McpStreamEvent> {
    yield this.errorEvent(code, message, retryable);
  }

  /**
   * POST `body` and yield parsed SSE events until 'done', end-of-stream, or
   * abort. Transport failures surface as a terminal 'error' event rather than
   * a thrown exception, so consumers have a single event-driven code path.
   * A user-initiated abort ends the stream silently, since stopping is not an error.
   */
  private async *stream(
    path: string,
    body: unknown,
    headers: Record<string, string>,
    signal?: AbortSignal
  ): AsyncGenerator<McpStreamEvent> {
    if (signal?.aborted) {
      return; // Cancelled before the (lazy) generator ever ran, so never send the POST.
    }
    const fetchFn = this.options.fetchFn ?? fetch.bind(globalThis);
    const controller = new AbortController();
    const onOuterAbort = () => controller.abort();
    signal?.addEventListener('abort', onOuterAbort);

    let timedOut = false;
    const timeout = setTimeout(() => {
      timedOut = true;
      controller.abort();
    }, this.options.firstTokenTimeoutMs);

    try {
      const response = await fetchFn(`${this.options.baseUrl.replace(/\/+$/, '')}${path}`, {
        method: 'POST',
        headers: {
          ...headers,
          'Content-Type': 'application/json',
          Accept: 'text/event-stream'
        },
        body: JSON.stringify(body),
        signal: controller.signal
      });

      if (!response.ok) {
        yield await this.httpError(response);
        return;
      }
      if (!response.body) {
        yield this.errorEvent('INTERNAL', 'Empty response body', false);
        return;
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';
      let firstChunk = true;

      while (true) {
        const { done, value } = await reader.read();
        if (done) {
          break;
        }
        if (firstChunk) {
          clearTimeout(timeout);
          firstChunk = false;
        }
        buffer += decoder.decode(value, { stream: true });
        buffer = buffer.replace(/\r\n/g, '\n');

        let separator: number;
        while ((separator = buffer.indexOf('\n\n')) !== -1) {
          const block = buffer.slice(0, separator);
          buffer = buffer.slice(separator + 2);
          const event = this.parseBlock(block);
          if (event) {
            yield event;
            if (event.type === 'done') {
              return;
            }
          }
        }
      }
    } catch (error) {
      if (signal?.aborted) {
        return; // User pressed stop, so end silently.
      }
      if (timedOut) {
        yield this.errorEvent('LLM_UNAVAILABLE', undefined, true);
        return;
      }
      // The detail goes to the console, not to the officer. A transport failure surfaces from
      // the browser as "Failed to fetch", which is what a blocked CORS preflight, a DNS
      // failure and an unreachable host all look like from here: it tells whoever is
      // configuring the deployment something, and tells a loan officer nothing at all. The
      // panel says it could not reach the assistant, which is the part that is true and useful.
      console.error('Copilot transport failed', error);
      yield this.errorEvent('INTERNAL', undefined, false);
    } finally {
      clearTimeout(timeout);
      signal?.removeEventListener('abort', onOuterAbort);
      // Release the connection on EVERY exit path. Without this, a gateway that keeps the
      // socket open after 'done' (keep-alive comments are a normal SSE pattern) would leak
      // one locked stream per turn until the browser's per-host connection limit stalls
      // all further requests.
      controller.abort();
    }
  }

  /** Parse one SSE block ("event: x\ndata: {...}") into a typed event; null when malformed. */
  private parseBlock(block: string): McpStreamEvent | null {
    let eventName = '';
    const dataLines: string[] = [];
    for (const line of block.split('\n')) {
      if (line.startsWith('event:')) {
        eventName = line.slice(6).trim();
      } else if (line.startsWith('data:')) {
        dataLines.push(line.slice(5).trimStart());
      }
      // ':' comments and 'id:'/'retry:' fields are intentionally ignored.
    }
    if (dataLines.length === 0) {
      return null;
    }
    let payload: Record<string, unknown>;
    try {
      payload = JSON.parse(dataLines.join('\n'));
    } catch {
      return null; // Malformed frames are skipped, never surfaced to the UI.
    }
    if (!payload || typeof payload !== 'object') {
      return null;
    }
    const type = (eventName || (payload['type'] as string) || '') as McpStreamEventType;
    if (!VALID_EVENT_TYPES.includes(type)) {
      return null;
    }
    return this.normalize(type, payload);
  }

  /** Map a contract v1 payload (snake_case) onto the frontend event model. */
  private normalize(type: McpStreamEventType, payload: Record<string, unknown>): McpStreamEvent {
    switch (type) {
      case 'token':
        return { type, token: String(payload['delta'] ?? payload['token'] ?? '') };
      case 'thinking': {
        const phase = payload['phase'];
        return {
          type,
          thinkingPhase: phase === 'start' || phase === 'end' ? phase : 'delta',
          thinking: payload['delta'] != null ? String(payload['delta']) : undefined,
          thinkingElapsedMs: typeof payload['elapsed_ms'] === 'number' ? payload['elapsed_ms'] : undefined
        };
      }
      case 'tool_call':
        return {
          type,
          toolName: payload['tool'] != null ? String(payload['tool']) : undefined,
          // The gateway names the step; falling back to the raw tool id keeps an older
          // gateway working rather than showing the officer an empty row.
          toolLabel: payload['label'] != null ? String(payload['label']) : undefined,
          toolPhase: payload['phase'] === 'finished' ? 'finished' : 'started',
          readOnly: payload['read_only'] === true,
          durationMs: typeof payload['duration_ms'] === 'number' ? payload['duration_ms'] : undefined,
          summary: payload['summary'] != null ? String(payload['summary']) : undefined
        };
      case 'action_card':
        return this.normalizeActionCard(payload);
      case 'suggest': {
        const items = Array.isArray(payload['items']) ? payload['items'] : [];
        return { type, suggestions: items.map((item) => String(item)).filter((item) => item.trim().length > 0) };
      }
      case 'done':
        return {
          type,
          conversationId: payload['conversation_id'] != null ? String(payload['conversation_id']) : undefined
        };
      case 'error':
        return this.errorEvent(
          this.toErrorCode(payload['code']),
          payload['message'] != null ? String(payload['message']) : 'Something went wrong.',
          payload['retryable'] === true
        );
      default:
        return { type };
    }
  }

  /**
   * Rows arrive as an ordered object so the gateway controls what the officer reads first
   * (who and which account, then what changes). Blank values are dropped rather than shown
   * as an empty line.
   */
  private toDisplayRows(raw: unknown): CardRow[] {
    if (!raw || typeof raw !== 'object' || Array.isArray(raw)) {
      return [];
    }
    return Object.entries(raw as Record<string, unknown>)
      .map(
        ([
          label,
          value
        ]) => ({ label, value: value == null ? '' : String(value) })
      )
      .filter((row) => row.label.trim().length > 0 && row.value.trim().length > 0);
  }

  /** An action_card with a card_id awaits approval; without one it is display-only. */
  private normalizeActionCard(payload: Record<string, unknown>): McpStreamEvent {
    const cardId = payload['card_id'];
    if (cardId != null && !CARD_ID_PATTERN.test(String(cardId))) {
      // Malformed id: refuse the action AND tell the officer, so a confirmation
      // prompt is never left on screen with no card and no explanation.
      return this.errorEvent('INTERNAL', 'Invalid confirmation reference.', false);
    }
    if (cardId != null) {
      const pendingAction: PendingAction = {
        cardId: String(cardId),
        tool: String(payload['tool'] ?? ''),
        args: this.toRecord(payload['args']),
        display: this.toDisplayRows(payload['rows']),
        humanSummary: String(payload['human_summary'] ?? payload['summary'] ?? ''),
        idempotencyKey: payload['idempotency_key'] != null ? String(payload['idempotency_key']) : undefined,
        expiresAt: payload['expires_at'] != null ? String(payload['expires_at']) : undefined
      };
      return { type: 'action_card', pendingAction };
    }
    const card = payload['card'];
    if (card && typeof card === 'object') {
      return { type: 'action_card', card: card as ActionCard };
    }
    return { type: 'action_card' };
  }

  /** Map an HTTP failure to a contract error event (401/403/429/503 are meaningful). */
  private async httpError(response: Response): Promise<McpStreamEvent> {
    let code: McpErrorCode;
    let retryable = false;
    switch (response.status) {
      case 401:
        code = 'AUTH_EXPIRED';
        retryable = true;
        break;
      case 403:
        code = 'PERMISSION_DENIED';
        break;
      case 429:
        code = 'RATE_LIMITED';
        retryable = true;
        break;
      case 502:
      case 503:
      case 504:
        code = 'LLM_UNAVAILABLE';
        retryable = true;
        break;
      default:
        code = 'INTERNAL';
    }
    let message = `Request failed (${response.status})`;
    try {
      const parsed = await response.json();
      if (parsed && typeof parsed === 'object') {
        message = String(parsed.message ?? message);
        code = this.toErrorCode(parsed.code ?? code);
        if (typeof parsed.retryable === 'boolean') {
          retryable = parsed.retryable;
        }
      }
    } catch {
      // Non-JSON error body, so keep the status-derived defaults.
    }
    return this.errorEvent(code, message, retryable);
  }

  private toErrorCode(value: unknown): McpErrorCode {
    const codes: McpErrorCode[] = [
      'AUTH_EXPIRED',
      'PERMISSION_DENIED',
      'LLM_UNAVAILABLE',
      'TOOL_FAILED',
      'RATE_LIMITED',
      'CANCELLED',
      'INTERNAL'
    ];
    return codes.includes(value as McpErrorCode) ? (value as McpErrorCode) : 'INTERNAL';
  }

  private errorEvent(errorCode: McpErrorCode, message: string | undefined, retryable: boolean): McpStreamEvent {
    return { type: 'error', errorCode, message, retryable };
  }

  private toRecord(value: unknown): Record<string, unknown> {
    return value && typeof value === 'object' && !Array.isArray(value) ? (value as Record<string, unknown>) : {};
  }
}
