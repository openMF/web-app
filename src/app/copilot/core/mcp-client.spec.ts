/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { describe, it, expect, jest } from '@jest/globals';
import { TextDecoder as NodeTextDecoder, TextEncoder as NodeTextEncoder } from 'util';

import { McpClient } from './mcp-client';
import { McpChatRequest, McpStreamEvent } from './models/mcp-response.model';

// jsdom does not expose the encoding globals the streaming client uses.
(globalThis as any).TextEncoder ??= NodeTextEncoder;
(globalThis as any).TextDecoder ??= NodeTextDecoder;

const REQUEST: McpChatRequest = {
  message: 'Show loans for Rajesh',
  clientMsgId: 'msg-1',
  context: {
    clientId: 42,
    clientName: 'Rajesh Kumar',
    loanId: null,
    screen: 'client-detail',
    loggedInUser: 'priya',
    role: 'Loan Officer',
    language: 'en'
  }
};

/** Builds a fetch mock whose body yields the given raw SSE chunks in order. */
function fetchWithChunks(chunks: string[], init: Partial<Response> = {}): typeof fetch {
  const encoder = new NodeTextEncoder();
  const queue = chunks.map((chunk) => encoder.encode(chunk) as Uint8Array);
  const reader = {
    read: jest.fn(async () => {
      const value = queue.shift();
      return value ? { done: false, value } : { done: true, value: undefined };
    })
  };
  return jest.fn(async () => ({
    ok: true,
    status: 200,
    body: { getReader: () => reader },
    ...init
  })) as unknown as typeof fetch;
}

async function collect(iterable: AsyncIterable<McpStreamEvent>): Promise<McpStreamEvent[]> {
  const events: McpStreamEvent[] = [];
  for await (const event of iterable) {
    events.push(event);
  }
  return events;
}

function client(fetchFn: typeof fetch, firstTokenTimeoutMs = 60_000): McpClient {
  return new McpClient({ baseUrl: 'https://gateway.example', firstTokenTimeoutMs, fetchFn });
}

describe('McpClient', () => {
  it('parses token, suggest and done events from an SSE stream', async () => {
    const fetchFn = fetchWithChunks([
      'event: token\ndata: {"delta":"Hel"}\n\n',
      'event: token\ndata: {"delta":"lo"}\n\nevent: suggest\ndata: {"items":["Show schedule"]}\n\n',
      'event: done\ndata: {"conversation_id":"c-1"}\n\n'
    ]);
    const events = await collect(client(fetchFn).chat(REQUEST, {}));

    expect(events.map((event) => event.type)).toEqual([
      'token',
      'token',
      'suggest',
      'done'
    ]);
    expect(events[0].token).toBe('Hel');
    expect(events[2].suggestions).toEqual(['Show schedule']);
    expect(events[3].conversationId).toBe('c-1');
  });

  it('reassembles frames split across chunk boundaries and CRLF newlines', async () => {
    const fetchFn = fetchWithChunks([
      'event: token\r\ndata: {"del',
      'ta":"Hi"}\r\n\r\nevent: done\r\ndata: {}\r\n\r\n'
    ]);
    const events = await collect(client(fetchFn).chat(REQUEST, {}));

    expect(events.map((event) => event.type)).toEqual([
      'token',
      'done'
    ]);
    expect(events[0].token).toBe('Hi');
  });

  it('maps a snake_case action_card payload to a PendingAction', async () => {
    const fetchFn = fetchWithChunks([
      'event: action_card\ndata: {"card_id":"card-7","tool":"fineract_loan_approve",' +
        '"args":{"loanId":4521},"human_summary":"Approve loan #4521","idempotency_key":"srv-1",' +
        '"expires_at":"2026-08-09T12:00:00Z"}\n\n',
      'event: done\ndata: {}\n\n'
    ]);
    const events = await collect(client(fetchFn).chat(REQUEST, {}));

    expect(events[0].pendingAction).toEqual({
      cardId: 'card-7',
      tool: 'fineract_loan_approve',
      args: { loanId: 4521 },
      humanSummary: 'Approve loan #4521',
      idempotencyKey: 'srv-1',
      expiresAt: '2026-08-09T12:00:00Z'
    });
  });

  it('skips malformed frames without surfacing an error', async () => {
    const fetchFn = fetchWithChunks([
      'event: token\ndata: {not json}\n\n',
      'event: token\ndata: {"delta":"ok"}\n\n',
      'event: done\ndata: {}\n\n'
    ]);
    const events = await collect(client(fetchFn).chat(REQUEST, {}));

    expect(events.map((event) => event.type)).toEqual([
      'token',
      'done'
    ]);
    expect(events[0].token).toBe('ok');
  });

  it('stops yielding after the done event even when more frames follow', async () => {
    const fetchFn = fetchWithChunks([
      'event: done\ndata: {}\n\nevent: token\ndata: {"delta":"late"}\n\n'
    ]);
    const events = await collect(client(fetchFn).chat(REQUEST, {}));

    expect(events).toHaveLength(1);
    expect(events[0].type).toBe('done');
  });

  it('maps HTTP 401 to a retryable AUTH_EXPIRED error event', async () => {
    const fetchFn = jest.fn(async () => ({
      ok: false,
      status: 401,
      json: async () => ({ message: 'Token expired' })
    })) as unknown as typeof fetch;
    const events = await collect(client(fetchFn).chat(REQUEST, {}));

    expect(events).toHaveLength(1);
    expect(events[0]).toMatchObject({
      type: 'error',
      errorCode: 'AUTH_EXPIRED',
      message: 'Token expired',
      retryable: true
    });
  });

  it('sends contract headers and never retries the POST', async () => {
    const fetchFn = fetchWithChunks(['event: done\ndata: {}\n\n']);
    await collect(
      client(fetchFn).chat(REQUEST, { Authorization: 'Basic abc', 'Fineract-Platform-TenantId': 'default' })
    );

    expect(fetchFn).toHaveBeenCalledTimes(1);
    const [
      url,
      init
    ] = (fetchFn as jest.Mock).mock.calls[0] as [
      string,
      RequestInit
    ];
    expect(url).toBe('https://gateway.example/copilot/api/v1/chat');
    expect(init.method).toBe('POST');
    expect((init.headers as Record<string, string>)['Authorization']).toBe('Basic abc');
    expect((init.headers as Record<string, string>)['Accept']).toBe('text/event-stream');
    expect(JSON.parse(init.body as string).clientMsgId).toBe('msg-1');
  });

  it('targets the decision endpoint for approvals', async () => {
    const fetchFn = fetchWithChunks(['event: done\ndata: {}\n\n']);
    await collect(client(fetchFn).decision('card-7', { decision: 'approve', clientMsgId: 'msg-2' }, {}));

    const [url] = (fetchFn as jest.Mock).mock.calls[0] as [string];
    expect(url).toBe('https://gateway.example/copilot/api/v1/actions/card-7/decision');
  });

  it('ends silently when the caller aborts (stop is not an error)', async () => {
    const controller = new AbortController();
    const fetchFn = jest.fn(
      (_url: string, init: RequestInit) =>
        new Promise((_resolve, reject) => {
          init.signal?.addEventListener('abort', () => reject(new DOMException('Aborted', 'AbortError')));
        })
    ) as unknown as typeof fetch;

    const iterator = client(fetchFn).chat(REQUEST, {}, controller.signal)[Symbol.asyncIterator]();
    const pending = iterator.next();
    controller.abort();

    await expect(pending).resolves.toEqual({ done: true, value: undefined });
  });

  it('yields a retryable LLM_UNAVAILABLE error when the first token times out', async () => {
    jest.useFakeTimers();
    try {
      const fetchFn = jest.fn(
        (_url: string, init: RequestInit) =>
          new Promise((_resolve, reject) => {
            init.signal?.addEventListener('abort', () => reject(new DOMException('Aborted', 'AbortError')));
          })
      ) as unknown as typeof fetch;

      const iterator = client(fetchFn, 60_000).chat(REQUEST, {})[Symbol.asyncIterator]();
      const pending = iterator.next();
      await jest.advanceTimersByTimeAsync(60_000);

      const { value } = await pending;
      expect(value).toMatchObject({ type: 'error', errorCode: 'LLM_UNAVAILABLE', retryable: true });
    } finally {
      jest.useRealTimers();
    }
  });
});
